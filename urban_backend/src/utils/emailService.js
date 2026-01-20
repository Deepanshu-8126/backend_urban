// src/utils/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS.trim()
  }
});

exports.sendOtpEmail = async (email, otp) => {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    console.log('📧 Invalid email:', email);
    return false;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code - Urban Complaint System',
    text: `Your 4-digit OTP code is: ${otp}\n\nValid for 5 minutes.`
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ OTP sent to:', email); // ✅ This shows "sent"
    return true;
  } catch (error) {
    console.error('📧 Email error:', error.message); // ❌ This shows actual error
    return false;
  }
};