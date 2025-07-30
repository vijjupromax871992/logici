// Location: src/auth/services/auth.service.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const OTP = require('../../models/Otp');

// Google Auth login logic: Uses Google ID to authenticate and generate JWT.
exports.googleAuth = async (googleId) => {
    
    const user = await User.findOne({ where: { google_id: googleId } });
    if (!user) {
        throw new Error('User not found');
    }


    return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Forgot password logic: Sends OTP to user’s email for password reset.
exports.forgotPassword = async (email) => {

    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new Error('User not found');
    }

    const otpCode = sendOTP(user.id);

    await OTP.create({ user_id: user.id, otp_code: otpCode });

    return 'Password reset OTP sent to your email';
};

// Reset password logic: Resets the user’s password after OTP verification.
exports.resetPassword = async (email, newPassword, otp) => {

    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new Error('User not found');
    }

    await this.verifyOTP(otp);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    return 'Password reset successfully';
};