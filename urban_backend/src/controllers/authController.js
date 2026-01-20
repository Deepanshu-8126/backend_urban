const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendOtpEmail } = require('../utils/emailService');

// In-memory OTP store
const otpStore = new Map();

// Generate 4-digit OTP (10 minutes validity)
const generateOtp = (email) => {
  // Clear any existing OTP for this email
  otpStore.delete(email);
  
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  otpStore.set(email, { 
    otp, 
    expiresAt: Date.now() + 600000 // 10 minutes
  });
  
  // ❌ REMOVED CONSOLE LOG (as per workflow)
  return otp;
};

const verifyOtp = (email, otp) => {
  const stored = otpStore.get(email);
  
  if (!stored) {
    return { valid: false, reason: 'OTP_NOT_FOUND' };
  }
  
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email);
    return { valid: false, reason: 'OTP_EXPIRED' };
  }
  
  if (stored.otp !== otp) {
    return { valid: false, reason: 'OTP_INVALID' };
  }
  
  otpStore.delete(email);
  return { valid: true };
};

// Check email
exports.checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email required' });
    }
    
    const user = await User.findOne({ email: email.trim() });
    res.json({ exists: !!user });
    
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// User Signup - Sends OTP to USER'S email
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email required' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }
    
    // Use consistent OTP generation
    const otp = generateOtp(email);
    const emailSent = await sendOtpEmail(email, otp);
    
    // ❌ REMOVED CONSOLE DISPLAY (as per workflow)
    
    if (!emailSent) {
      return res.status(500).json({ success: false, error: 'Failed to send OTP email' });
    }
    
    return res.json({ 
      success: true, 
      message: 'OTP sent to your email',
      email
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ success: false, error: 'Signup failed' });
  }
};

// Verify OTP login (handles both new and existing users)
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp, name, password } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and OTP are required' });
    }
    
    const verification = verifyOtp(email, otp);
    
    if (!verification.valid) {
      let errorMessage = 'Invalid OTP. Please request a new OTP.';
      
      if (verification.reason === 'OTP_EXPIRED') {
        errorMessage = 'OTP has expired. Please request a new OTP.';
      } else if (verification.reason === 'OTP_NOT_FOUND') {
        errorMessage = 'No OTP found for this email. Please request a new OTP.';
      }
      
      return res.status(400).json({ success: false, error: errorMessage });
    }
    
    let user = await User.findOne({ email });
    if (!user) {
      if (!name || !password) {
        return res.status(400).json({ success: false, error: 'Name and password required for new user' });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({ 
        name, 
        email, 
        password: hashedPassword,
        role: 'Citizen' 
      });
      await user.save();
    }
    
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, 
      process.env.JWT_SECRET || 'urban_secret', { expiresIn: '24h' });
    
    res.json({ success: true, message: 'Login successful', token, user: {
      id: user._id, name: user.name, email: user.email, role: user.role
    }});
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
  }
};

// Password login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, error: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, 
      process.env.JWT_SECRET || 'urban_secret', { expiresIn: '24h' });
    
    res.json({ success: true, message: 'Login successful', token, user: {
      id: user._id, name: user.name, email: user.email, role: user.role
    }});
  } catch (error) {
    res.status(500).json({ success: false, error: 'Login failed' });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, error: 'Email not found' });
    
    const otp = generateOtp(email); // Use your existing generateOtp function
    const emailSent = await sendOtpEmail(email, otp);
    
    if (!emailSent) {
      return res.status(500).json({ success: false, error: 'Failed to send OTP email' });
    }
    
    return res.json({ 
      success: true, 
      message: 'OTP sent to your email',
      email 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, error: 'Failed to process request' });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }
    
    const verification = verifyOtp(email, otp); // Use your existing verifyOtp function
    if (!verification.valid) {
      let errorMessage = 'Invalid OTP. Please request a new OTP.';
      if (verification.reason === 'OTP_EXPIRED') {
        errorMessage = 'OTP has expired. Please request a new OTP.';
      }
      return res.status(400).json({ success: false, error: errorMessage });
    }
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    
    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, error: 'Failed to reset password' });
  }
};// Forgot password
// Add these functions at the end of your authController.js file:

// Forgot Password Function
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, error: 'Email not found' });
    
    // Generate OTP and send via email
    const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
    const emailSent = await sendOtpEmail(email, otp);
    
    if (!emailSent) {
      return res.status(500).json({ success: false, error: 'Failed to send OTP email' });
    }
    
    // Store OTP temporarily (you can use your existing OTP storage method)
    // For now, using in-memory storage like your existing code
    if (!global.otpStore) global.otpStore = new Map();
    global.otpStore.set(email, { 
      otp, 
      expiresAt: Date.now() + 600000 // 10 minutes
    });
    
    return res.json({ 
      success: true, 
      message: 'OTP sent to your email',
      email 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, error: 'Failed to process request' });
  }
};

// Reset Password Function
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }
    
    // Verify OTP (using your existing OTP verification logic)
    if (!global.otpStore) global.otpStore = new Map();
    const stored = global.otpStore.get(email);
    
    if (!stored) {
      return res.status(400).json({ success: false, error: 'Invalid OTP. Please request a new OTP.' });
    }
    
    if (Date.now() > stored.expiresAt) {
      global.otpStore.delete(email);
      return res.status(400).json({ success: false, error: 'OTP has expired. Please request a new OTP.' });
    }
    
    if (stored.otp !== otp) {
      return res.status(400).json({ success: false, error: 'Invalid OTP. Please try again.' });
    }
    
    // Update password
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    
    // Delete OTP after successful reset
    global.otpStore.delete(email);
    
    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, error: 'Failed to reset password' });
  }
};
console.log('✅ All auth controller functions loaded');