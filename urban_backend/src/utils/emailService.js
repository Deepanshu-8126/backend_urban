const nodemailer = require('nodemailer');

// Check if environment variables exist
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

if (!emailUser || !emailPass) {
  console.error('❌ EMAIL_USER or EMAIL_PASS not found in .env file!');
  console.error('Please add EMAIL_USER and EMAIL_PASS to your .env file');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass.trim()
  }
});

exports.sendOtpEmail = async (email, otp) => {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    console.log('📧 Invalid email:', email);
    return false;
  }

  const mailOptions = {
    from: emailUser,
    to: email,
    subject: 'Your OTP Code - Urban Complaint System',
    text: `Your 4-digit OTP code is: ${otp}\n\nValid for 5 minutes.`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ OTP sent to:', email);
    return true;
  } catch (error) {
    console.error('📧 Email error:', error.message);
    return false;
  }
};
