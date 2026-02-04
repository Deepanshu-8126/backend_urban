// Simple in-memory OTP store
const otpStore = new Map();

exports.generateOtp = (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, { 
    otp, 
    expiresAt: Date.now() + 300000 // 5 minutes
  });
  console.log(`📧 OTP for ${email}: ${otp}`);
  return otp;
};

exports.verifyOtp = (email, otp) => {
  const stored = otpStore.get(email);
  if (!stored) return { valid: false, reason: 'OTP_EXPIRED' };
  
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