const crypto = require('crypto');
const transporter = require('../config/emailConfig'); // Import the configured transporter
const { OTP, User } = require('../models'); // Use Sequelize models instead of raw queries

exports.sendOtp = async (req, res) => {
  const { email, mobile } = req.body;

  if (!email && !mobile) {
    return res.status(400).json({ message: 'Email or mobile number is required.' });
  }

  try {
    // Generate a random 6-digit OTP
    const otp = crypto.randomInt(100000, 999999);
    const identifier = email || mobile;
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    

    // Find the user first (for forgot password, user must exist)
    const user = await User.findOne({
      where: {
        [email ? 'email' : 'mobileNumber']: identifier
      }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found with this email address' 
      });
    }

    // Delete any existing OTPs for this user
    await OTP.destroy({
      where: {
        user_id: user.id,
        otp_type: email ? 'email' : 'mobile'
      }
    });

    // Insert OTP into the database using Sequelize model
    await OTP.create({
      user_id: user.id,
      otp_code: otp.toString(),
      otp_type: email ? 'email' : 'mobile',
      expires_at: expiresAt,
      is_verified: false
    });

    if (email) {
      // Send OTP via email
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Password Reset OTP',
        text: `Your OTP for password reset is ${otp}. It is valid for 5 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #00599c;">Password Reset OTP</h2>
            <p>Your OTP for password reset is:</p>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #00599c; font-size: 32px; margin: 0;">${otp}</h1>
            </div>
            <p>This OTP is valid for 5 minutes only.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
          </div>
        `
      });

      return res.status(200).json({ 
        success: true, 
        message: 'OTP sent to your email.' 
      });
    } else if (mobile) {
      // Placeholder for sending OTP via SMS
      return res.status(200).json({ 
        success: true, 
        message: 'OTP sent to your mobile number.' 
      });
    }
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error sending OTP.' 
    });
  }
};

exports.verifyOtp = async (req, res) => {
  const { otp, email, mobile } = req.body;

  if (!otp || (!email && !mobile)) {
    return res.status(400).json({ message: 'OTP and email or mobile are required.' });
  }

  try {
    const identifier = email || mobile;

    // Find the user first
    const user = await User.findOne({
      where: {
        [email ? 'email' : 'mobileNumber']: identifier
      }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if the OTP exists and is valid using Sequelize model
    const otpRecord = await OTP.findOne({
      where: {
        user_id: user.id,
        otp_code: otp,
        otp_type: email ? 'email' : 'mobile',
        expires_at: {
          [require('sequelize').Op.gt]: new Date()
        },
        is_verified: false
      },
      order: [['createdAt', 'DESC']]
    });

    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: 'OTP expired or invalid.' 
      });
    }

    // Mark OTP as verified and delete it
    await otpRecord.destroy();

    return res.status(200).json({ 
      success: true, 
      message: 'OTP verified successfully.' 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error verifying OTP.' 
    });
  }
};