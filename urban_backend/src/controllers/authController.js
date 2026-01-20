const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendOtpEmail } = require('../utils/emailService');

// In-memory OTP store
const otpStore = new Map();

// Generate 4-digit OTP (10 minutes validity)
const generateOtp = (email) => {
  console.log('🔑 Generating OTP for:', email);
  otpStore.delete(email);
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  otpStore.set(email, { 
    otp, 
    expiresAt: Date.now() + 600000 // 10 minutes
  });
  console.log('✅ OTP generated:', otp);
  return otp;
};

const verifyOtp = (email, otp) => {
  console.log('🔍 Verifying OTP for:', email, 'OTP:', otp);
  const stored = otpStore.get(email);
  
  if (!stored) {
    console.log('❌ OTP not found for:', email);
    return { valid: false, reason: 'OTP_NOT_FOUND' };
  }
  
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email);
    console.log('❌ OTP expired for:', email);
    return { valid: false, reason: 'OTP_EXPIRED' };
  }
  
  if (stored.otp !== otp) {
    console.log('❌ Invalid OTP for:', email, 'Expected:', stored.otp, 'Received:', otp);
    return { valid: false, reason: 'OTP_INVALID' };
  }
  
  otpStore.delete(email);
  console.log('✅ OTP verified for:', email);
  return { valid: true };
};

// Check email
exports.checkEmail = async (req, res) => {
  try {
    console.log('📧 Checking email request body:', req.body);
    
    // 🔥 FIXED: Check if body exists
    if (!req.body) {
      return res.status(400).json({ success: false, error: 'Request body is required' });
    }
    
    const { email } = req.body;
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      console.log('❌ Invalid email:', email);
      return res.status(400).json({ success: false, error: 'Valid email required' });
    }
    
    const user = await User.findOne({ email: email.trim() });
    console.log('🔍 User exists:', !!user, 'Email:', email);
    res.json({ exists: !!user });
    
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// User Signup - Sends OTP to USER'S email
exports.signup = async (req, res) => {
  try {
    console.log('🆕 Signup request body:', req.body);
    
    // 🔥 FIXED: Check if body exists
    if (!req.body) {
      return res.status(400).json({ success: false, error: 'Request body is required' });
    }
    
    const { name, email, password } = req.body;
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      console.log('❌ Invalid email for signup:', email);
      return res.status(400).json({ success: false, error: 'Valid email required' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ Email already registered:', email);
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }
    
    // Use consistent OTP generation
    const otp = generateOtp(email);
    const emailSent = await sendOtpEmail(email, otp);
    
    if (!emailSent) {
      console.log('❌ Failed to send OTP email:', email);
      return res.status(500).json({ success: false, error: 'Failed to send OTP email' });
    }
    
    console.log('✅ OTP sent to:', email);
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
    console.log('✅ OTP verification request body:', req.body);
    
    // 🔥 FIXED: Check if body exists
    if (!req.body) {
      return res.status(400).json({ success: false, error: 'Request body is required' });
    }
    
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
        role: 'citizen' 
      });
      await user.save();
      console.log('✅ New user created:', user.email);
    }
    
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, 
      process.env.JWT_SECRET || 'urban_secret', { expiresIn: '24h' });
    
    console.log('🔐 Token generated for:', user.email);
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
    console.log('🔐 Login request body:', req.body);
    
    // 🔥 FIXED: Check if body exists
    if (!req.body) {
      return res.status(400).json({ success: false, error: 'Request body is required' });
    }
    
    const { email, password } = req.body;
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      console.log('❌ Invalid email for login:', email);
      return res.status(400).json({ success: false, error: 'Valid email required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(404).json({ success: false, error: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Password incorrect for:', email);
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, 
      process.env.JWT_SECRET || 'urban_secret', { expiresIn: '24h' });
    
    console.log('✅ Login successful for:', user.email);
    res.json({ success: true, message: 'Login successful', token, user: {
      id: user._id, name: user.name, email: user.email, role: user.role
    }});
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    console.log(' recover password request body:', req.body);
    
    // 🔥 FIXED: Check if body exists
    if (!req.body) {
      return res.status(400).json({ success: false, error: 'Request body is required' });
    }
    
    const { email } = req.body;
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      console.log('❌ Invalid email for password recovery:', email);
      return res.status(400).json({ success: false, error: 'Valid email required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found for password recovery:', email);
      return res.status(404).json({ success: false, error: 'Email not found' });
    }
    
    const otp = generateOtp(email);
    const emailSent = await sendOtpEmail(email, otp);
    
    if (!emailSent) {
      console.log('❌ Failed to send OTP for password recovery:', email);
      return res.status(500).json({ success: false, error: 'Failed to send OTP email' });
    }
    
    console.log('✅ Password recovery OTP sent to:', email);
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
    console.log('🔄 Password reset request body:', req.body);
    
    // 🔥 FIXED: Check if body exists
    if (!req.body) {
      return res.status(400).json({ success: false, error: 'Request body is required' });
    }
    
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      console.log('❌ Missing required fields for password reset:', { email, otp, newPassword });
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }
    
    const verification = verifyOtp(email, otp);
    if (!verification.valid) {
      console.log('❌ Password reset OTP verification failed:', verification.reason);
      let errorMessage = 'Invalid OTP. Please request a new OTP.';
      if (verification.reason === 'OTP_EXPIRED') {
        errorMessage = 'OTP has expired. Please request a new OTP.';
      }
      return res.status(400).json({ success: false, error: errorMessage });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found for password reset:', email);
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    
    console.log('✅ Password reset successful for:', email);
    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, error: 'Failed to reset password' });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    console.log('👤 Profile request for user:', req.user?.id);
    
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      console.log('❌ User not found for profile:', req.user.id);
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    console.log('✅ Profile retrieved for:', user.email);
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to get profile' });
  }
};

console.log('✅ All auth controller functions loaded');
console.log('Controller functions:', Object.keys(exports));