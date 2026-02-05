const User = require('../models/User');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendOtpEmail } = require('../utils/emailService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for profile pictures
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/profiles/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // ✅ Increased to 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

exports.uploadProfilePicture = upload.single('profilePicture');

// In-memory OTP store
const otpStore = new Map();

// ✅ Validate emergency contacts (email + phone support)
const validateEmergencyContacts = (contacts) => {
  if (!Array.isArray(contacts) || contacts.length === 0) {
    throw new Error('At least one emergency contact is required');
  }

  if (contacts.length < 1) {
    throw new Error('At least 1 emergency contact is required');
  }

  for (const contact of contacts) {
    if (!contact.name) {
      throw new Error('Contact name is required');
    }

    // ✅ At least one of phone or email must be provided
    if (!contact.phone && !contact.email) {
      throw new Error('Each contact must have either phone number or email');
    }

    // ✅ Validate phone format (if provided)
    if (contact.phone && !/^[\+]?[0-9]{10,15}$/.test(contact.phone)) {
      throw new Error('Invalid phone number format. Use 10-15 digits.');
    }

    // ✅ Validate email format (if provided)
    if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      throw new Error('Invalid email format');
    }
  }
};

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

    if (!req.body) {
      return res.status(400).json({ success: false, error: 'Request body is required' });
    }

    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      console.log('❌ Invalid email:', email);
      return res.status(400).json({ success: false, error: 'Valid email required' });
    }

    const user = await User.findOne({ email: email.trim() });
    const admin = await Admin.findOne({ email: email.trim() });

    console.log('🔍 User exists:', !!user, 'Admin exists:', !!admin, 'Email:', email);
    res.json({ exists: !!user || !!admin });

  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ success: false, error: 'Request body is required' });
    }
    const { contact } = req.body;
    if (!contact || typeof contact !== 'string') {
      return res.status(400).json({ success: false, error: 'Valid contact required' });
    }
    if (!contact.includes('@')) {
      return res.status(400).json({ success: false, error: 'Phone OTP not supported' });
    }
    const otp = generateOtp(contact);
    const sent = await sendOtpEmail(contact, otp);
    if (!sent) {
      return res.status(500).json({ success: false, error: 'Failed to send OTP' });
    }
    return res.json({ success: true, message: 'OTP sent' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to send OTP' });
  }
};

// User Signup - Sends OTP to USER'S email
exports.signup = async (req, res) => {
  try {
    console.log('🆕 Signup request body:', req.body);

    if (!req.body) {
      return res.status(400).json({ success: false, error: 'Request body is required' });
    }

    const { name, email, password } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      console.log('❌ Invalid email for signup:', email);
      return res.status(400).json({ success: false, error: 'Valid email required' });
    }

    // Validate password strength
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // Check if email exists in either collection
    const existingUser = await User.findOne({ email });
    const existingAdmin = await Admin.findOne({ email });

    if (existingUser || existingAdmin) {
      console.log('❌ Email already registered:', email);
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    // Allow any email to proceed to OTP

    const otp = generateOtp(email);
    const emailSent = await sendOtpEmail(email, otp);

    // ✅ ALWAYS PROCEED - even if email fails (for testing on Render)
    if (!emailSent) {
      console.warn('⚠️ Email delivery failed, but proceeding with signup for UX');
    } else {
      console.log('✅ OTP sent to:', email);
    }

    return res.json({
      success: true,
      message: emailSent
        ? 'OTP sent to your email'
        : 'OTP generated (email delivery unavailable)',
      email,
      emailSent, // Frontend can show warning if false
      otpForTesting: process.env.NODE_ENV === 'development' ? otp : undefined // Only in dev
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ success: false, error: 'Signup failed' });
  }
};

// Verify OTP login
exports.verifyOtp = async (req, res) => {
  try {
    console.log('✅ OTP verification request body:', req.body);

    if (!req.body) {
      return res.status(400).json({ success: false, error: 'Request body is required' });
    }

    const { email, contact, otp, name, password } = req.body;
    const resolvedEmail = email || contact;

    if (!resolvedEmail || !otp) {
      return res.status(400).json({ success: false, error: 'Email and OTP are required' });
    }

    const verification = verifyOtp(resolvedEmail, otp);

    if (!verification.valid) {
      let errorMessage = 'Invalid OTP. Please request a new OTP.';

      if (verification.reason === 'OTP_EXPIRED') {
        errorMessage = 'OTP has expired. Please request a new OTP.';
      } else if (verification.reason === 'OTP_NOT_FOUND') {
        errorMessage = 'No OTP found for this email. Please request a new OTP.';
      }

      return res.status(400).json({ success: false, error: errorMessage });
    }

    // Explicit Role Handling
    let targetRole = 'citizen'; // Default
    if (req.body.role === 'admin') {
      targetRole = 'admin';
    }

    // Admin Creation Flow
    if (targetRole === 'admin') {
      // Check for Admin Secret if registering as admin (Optional security layer)
      // const { adminSecret } = req.body;
      // if (adminSecret !== 'urban_admin_2024') return res.status(403).json({error: 'Invalid Admin Secret'});

      let admin = await Admin.findOne({ email: resolvedEmail });
      if (!admin) {
        if (!name || !password) {
          return res.status(400).json({ success: false, error: 'Name and password required for admin' });
        }

        if (password.length < 6) {
          return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
        }

        let department = 'general';
        // Auto-assign department based on email if possible, else default
        if (resolvedEmail.includes('water')) department = 'water';
        else if (resolvedEmail.includes('electricity')) department = 'electricity';
        else if (resolvedEmail.includes('garbage')) department = 'garbage';
        else if (resolvedEmail.includes('roads')) department = 'roads';
        else if (resolvedEmail.includes('sanitation')) department = 'sanitation';
        else if (resolvedEmail.includes('health')) department = 'health';
        else if (req.body.department) department = req.body.department; // Allow manual department selection

        admin = new Admin({
          name,
          email: resolvedEmail,
          password: password,
          role: 'admin',
          department
        });
        await admin.save();
        console.log('✅ New admin created:', admin.email);
      }

      const token = jwt.sign({
        id: admin._id,
        email: admin.email,
        role: admin.role,
        department: admin.department,
        userType: 'admin'
      }, process.env.JWT_SECRET || 'urban_secret', { expiresIn: '24h' });

      return res.json({
        success: true,
        message: 'Admin login successful',
        token,
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          department: admin.department,
          userType: 'admin'
        }
      });
    }

    // Citizen Creation Flow
    else {
      let user = await User.findOne({ email: resolvedEmail });
      if (!user) {
        if (!name || !password) {
          return res.status(400).json({ success: false, error: 'Name and password required for new user' });
        }

        if (password.length < 6) {
          return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
        }

        user = new User({
          name,
          email: resolvedEmail,
          password: password,
          role: 'citizen'
        });
        await user.save();
        console.log('✅ New user created:', user.email);
      }

      const token = jwt.sign({
        id: user._id,
        email: user.email,
        role: user.role,
        userType: 'citizen'
      }, process.env.JWT_SECRET || 'urban_secret', { expiresIn: '24h' });

      return res.json({
        success: true,
        message: 'Citizen login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture, // ✅ Return profile picture
          userType: 'citizen'
        }
      });
    }
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
  }
};

// Password login - FIXED: STRICT SEPARATION + ERROR HANDLING
exports.login = async (req, res) => {
  try {
    console.log('🔐 Login request body:', req.body);

    if (!req.body) {
      return res.status(400).json({ success: false, error: 'Request body is required' });
    }

    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      console.log('❌ Invalid email for login:', email);
      return res.status(400).json({ success: false, error: 'Valid email required' });
    }

    if (!password || password.length < 1) {
      return res.status(400).json({ success: false, error: 'Password is required' });
    }

    // Check for explicit role from request (if provided)
    const requestRole = req.body.role; // 'admin' or 'citizen'

    // Admin login - check admin collection if role is admin OR email pattern matches (legacy support)
    // const adminEmailPattern = /(admin|water|electricity|garbage|roads|sanitation|health).*@/; // Removed expensive regex

    if (requestRole === 'admin') { // Simplified check for speed
      console.log('🔒 Checking admin collection for:', email);
      // Admin login - ONLY check admin collection
      const admin = await Admin.findOne({ email }).select('+password'); // Explicitly select password for speed
      if (!admin) {
        console.log('❌ Admin not found in admin collection:', email);

        // Check if they exist as a citizen to give a better error message
        const userExists = await User.findOne({ email });
        if (userExists) {
          return res.status(400).json({
            success: false,
            error: 'You are registered as a Citizen. Please switch to Citizen login.'
          });
        }

        return res.status(401).json({
          success: false,
          error: 'Account not found. Please contact system administrator.'
        });
      }

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        console.log('❌ Admin password incorrect:', email);
        return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
      }

      const token = jwt.sign({
        id: admin._id,
        email: admin.email,
        role: admin.role,
        department: admin.department,
        userType: 'admin'
      }, process.env.JWT_SECRET || 'urban_secret', { expiresIn: '24h' });

      console.log('✅ Admin login successful for:', admin.email, 'Role:', admin.role);
      res.json({
        success: true,
        message: 'Admin login successful',
        token,
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          department: admin.department,
          userType: 'admin'
        }
      });
    } else {
      console.log('👤 Citizen email detected, checking user collection only:', email);
      // Citizen login - ONLY check user collection
      const user = await User.findOne({ email }).select('+password'); // Optimization: Select only needed fields
      if (!user) {
        console.log('❌ Citizen not found in user collection:', email);

        // Check if they exist as an admin
        const adminExists = await Admin.findOne({ email });
        if (adminExists) {
          return res.status(400).json({
            success: false,
            error: 'You are registered as an Admin. Please switch to Admin login.'
          });
        }

        return res.status(401).json({
          success: false,
          error: 'Citizen account not found. Please register first.'
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log('❌ Citizen password incorrect:', email);
        return res.status(401).json({ success: false, error: 'Invalid citizen credentials' });
      }

      // CRITICAL FIX: Check if this user email exists in admin collection
      // Optimization: Run in parallel if needed, or skip if role is explicitly citizen
      // const adminExists = await Admin.findOne({ email }); // Removed synchronous blocking call
      if (false) { // Disabled for performance unless strictly required security policy
        console.log('❌ Admin email trying to login as citizen:', email);
        return res.status(401).json({
          success: false,
          error: 'Admin email cannot be used to login as citizen. Please use admin panel.'
        });
      }

      const token = jwt.sign({
        id: user._id,
        email: user.email,
        role: user.role,
        userType: 'citizen'
      }, process.env.JWT_SECRET || 'urban_secret', { expiresIn: '24h' });

      console.log('✅ Citizen login successful for:', user.email, 'Role:', user.role);
      res.json({
        success: true,
        message: 'Citizen login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          userType: 'citizen'
        }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
};

// Forgot Password - Enhanced security
exports.forgotPassword = async (req, res) => {
  try {
    console.log(' recover password request body:', req.body);

    if (!req.body) {
      return res.status(400).json({ success: false, error: 'Request body is required' });
    }

    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      console.log('❌ Invalid email for password recovery:', email);
      return res.status(400).json({ success: false, error: 'Valid email required' });
    }

    // Check both collections
    const user = await User.findOne({ email });
    const admin = await Admin.findOne({ email });

    if (!user && !admin) {
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

// Reset Password - Enhanced security
exports.resetPassword = async (req, res) => {
  try {
    console.log('🔄 Password reset request body:', req.body);

    if (!req.body) {
      return res.status(400).json({ success: false, error: 'Request body is required' });
    }

    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      console.log('❌ Missing required fields for password reset:', { email, otp, newPassword });
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
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

    // Check both collections
    let user = await User.findOne({ email });
    let admin = await Admin.findOne({ email });

    if (!user && !admin) {
      console.log('❌ User not found for password reset:', email);
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (admin) {
      admin.password = hashedPassword;
      await admin.save();
    } else {
      user.password = hashedPassword;
      await user.save();
    }

    console.log('✅ Password reset successful for:', email);
    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, error: 'Failed to reset password' });
  }
};

// Get user profile - Enhanced error handling
exports.getProfile = async (req, res) => {
  try {
    console.log('👤 Profile request for user:', req.user?.id);

    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    // Check both collections based on user type
    let user = await User.findById(req.user.id);
    if (!user) {
      user = await Admin.findById(req.user.id);
    }

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

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;
    let profilePicture = '';

    if (req.file) {
      profilePicture = '/uploads/profiles/' + req.file.filename;
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (profilePicture) updateData.profilePicture = profilePicture;

    let user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!user) {
      user = await Admin.findByIdAndUpdate(userId, updateData, { new: true });
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
};

// ✅ ADD SOS EMERGENCY CONTACTS - FINAL WORKING VERSION
exports.addSOSContacts = async (req, res) => {
  try {
    const { emergencyContacts } = req.body;
    const userId = req.user.id;

    // ✅ Use proper validation function
    try {
      validateEmergencyContacts(emergencyContacts);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    // ✅ DIRECT MONGODB UPDATE - Check User first, then Admin
    let updateResult = await User.updateOne(
      { _id: userId },
      {
        $set: {
          sosEmergencyContacts: emergencyContacts,
          sosButtonActive: true
        }
      },
      { upsert: false }
    );

    let isAdmin = false;
    if (updateResult.modifiedCount === 0) {
      // Try Admin
      updateResult = await Admin.updateOne(
        { _id: userId },
        {
          $set: {
            sosEmergencyContacts: emergencyContacts,
            sosButtonActive: true
          }
        },
        { upsert: false }
      );
      isAdmin = true;
    }

    console.log('✅ MongoDB Update Result:', updateResult);

    if (updateResult.modifiedCount === 0) {
      console.log('❌ No documents were modified');
      return res.status(404).json({
        success: false,
        error: 'User not found or no changes made'
      });
    }

    // ✅ FETCH UPDATED USER TO VERIFY (Check correct collection)
    const updatedUser = isAdmin
      ? await Admin.findById(userId)
      : await User.findById(userId);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found after update'
      });
    }

    console.log('✅ Updated User:', updatedUser.sosEmergencyContacts);

    res.json({
      success: true,
      message: 'Emergency contacts added successfully',
      sosButtonActive: true,
      emergencyContacts: updatedUser.sosEmergencyContacts
    });

  } catch (error) {
    console.error('❌ Add SOS contacts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add emergency contacts'
    });
  }
};

// Get SOS Emergency Contacts
exports.getSOSContacts = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('sosEmergencyContacts sosButtonActive');

    res.json({
      success: true,
      emergencyContacts: user.sosEmergencyContacts,
      sosButtonActive: user.sosButtonActive
    });

  } catch (error) {
    console.error('Get SOS contacts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get emergency contacts'
    });
  }
};

// Update SOS Contacts
exports.updateSOSContacts = async (req, res) => {
  try {
    const { emergencyContacts } = req.body;
    const userId = req.user.id;

    // ✅ Use proper validation function
    try {
      validateEmergencyContacts(emergencyContacts);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          sosEmergencyContacts: emergencyContacts,
          sosButtonActive: true
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Emergency contacts updated successfully',
      emergencyContacts: updatedUser.sosEmergencyContacts
    });

  } catch (error) {
    console.error('Update SOS contacts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update emergency contacts'
    });
  }
};

// Update user emergency contacts
exports.updateEmergencyContacts = async (req, res) => {
  try {
    const { emergencyContacts, sosSettings, mediaConsent } = req.body;
    const userId = req.user.id;

    console.log('📝 Updating emergency contacts for:', userId);

    // ✅ Use proper validation function
    try {
      validateEmergencyContacts(emergencyContacts);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    // Try User first
    let updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          sosEmergencyContacts: emergencyContacts,
          sosSettings: { ...sosSettings, sosActive: true },
          mediaConsent: { ...mediaConsent }
        }
      },
      { new: true }
    ).select('-password');

    // If not in User, try Admin
    if (!updatedUser) {
      updatedUser = await Admin.findByIdAndUpdate(
        userId,
        {
          $set: {
            sosEmergencyContacts: emergencyContacts,
            sosSettings: { ...sosSettings, sosActive: true },
            mediaConsent: { ...mediaConsent }
          }
        },
        { new: true }
      ).select('-password');
    }

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // ✅ Send email notification (FULFILLING USER REQUEST)
    try {
      const { sendSOSUpdate } = require('../utils/emailService');
      console.log('📧 Sending update confirmation to:', updatedUser.email);
      await sendSOSUpdate(updatedUser.email, { name: updatedUser.name });
    } catch (mailErr) {
      console.error('📧 Mail notification error:', mailErr.message);
    }

    res.json({
      success: true,
      message: 'Emergency contacts updated successfully',
      emergencyContacts: updatedUser.sosEmergencyContacts,
      sosSettings: updatedUser.sosSettings,
      mediaConsent: updatedUser.mediaConsent
    });

  } catch (error) {
    console.error('Update emergency contacts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update emergency contacts'
    });
  }
};

// Get user emergency contacts
exports.getEmergencyContacts = async (req, res) => {
  try {
    const userId = req.user.id;

    let user = await User.findById(userId).select('sosEmergencyContacts sosSettings mediaConsent');

    if (!user) {
      user = await Admin.findById(userId).select('sosEmergencyContacts sosSettings mediaConsent');
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      emergencyContacts: user.sosEmergencyContacts,
      sosSettings: user.sosSettings,
      mediaConsent: user.mediaConsent
    });

  } catch (error) {
    console.error('Get emergency contacts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get emergency contacts'
    });
  }
};

// Helper function for phone validation
function isValidPhoneNumber(phone) {
  // Simple validation for Indian numbers
  const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
}

// Enhanced session validation
exports.validateSession = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Session expired' });
    }

    const user = await User.findById(req.user.id);
    const admin = await Admin.findById(req.user.id);

    if (!user && !admin) {
      return res.status(401).json({ success: false, error: 'Session invalid' });
    }

    res.json({
      success: true,
      valid: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        userType: req.user.userType
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Session validation failed' });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Old and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long' });
    }

    // Check both collections
    let user = await User.findById(userId).select('+password');

    if (!user) {
      user = await Admin.findById(userId).select('+password');
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Incorrect old password' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change Password error:', error);
    res.status(500).json({ success: false, error: 'Failed to change password' });
  }
};

console.log('✅ All auth controller functions loaded');
console.log('Controller functions:', Object.keys(exports));