// Location: src/auth/controllers/auth.controller.js
const authService = require("../services/auth.service");
const User = require("../../models/User");
const OTP = require("../../models/Otp");
const RegisterOTP = require("../../models/RegisterOtp");
const { generateToken } = require("../../utils/jwt");
const nodemailer = require("nodemailer");
const { sendSMS } = require("../services/sns.service");
require("dotenv").config({ path: "../../.env" });
const { Sequelize } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const otpController = require("../../controllers/otpController");

// Create transporter for sending emails using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSKEY,
  },
  debug: true, // Enable debug logging
});

// Function to send email OTP
async function sendEmailOTP(email, otp) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Login OTP",
      text: `Your OTP for login is: ${otp}`,
    });
  } catch (error) {

    throw error;
  }
}

// Login logic: Handles user login request and sends JWT token if credentials are valid.
exports.login = async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;

    // Find user by email or mobile
    const user = await User.findOne({
      where: {
        [Sequelize.Op.or]: [
          { email: emailOrMobile },
          { mobileNumber: emailOrMobile }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token with isAdmin flag
    const token = jwt.sign(
      { 
        userId: user.id,
        isAdmin: user.isAdmin  // Include isAdmin in token
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove sensitive data from user object
    const userResponse = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      isAdmin: user.isAdmin  // Include isAdmin in response
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: userResponse
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

//Login : Send Otp to email or mobile
exports.sendOTP = async (req, res) => {
  try {
    const { type, value } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // First, check if user exists
    let user = await User.findOne({
      where: {
        [type === "email" ? "email" : "mobileNumber"]: value,
      },
    });

    let userId;
    if (!user) {
      return res.status(500).json({
        success: false,
        message: `User not registered.`,
      });
    } else {
      userId = user.id;
    }

    // Send OTP based on type
    if (type === "email") {
      await sendEmailOTP(value, otp);
    } else if (type === "mobile") {
      await sendSMS(value, `Your OTP is: ${otp}`);
    }

    // Store OTP
    await OTP.create({
      user_id: userId,
      otp_code: otp,
      otp_type: type,
      expires_at: expiresAt,
    });

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${value}`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to send OTP",
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { type, value, otp } = req.body;

    // First find the user
    const user = await User.findOne({
      where: {
        [type === "email" ? "email" : "mobileNumber"]: value,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    // Then find the OTP
    const otpRecord = await OTP.findOne({
      where: {
        user_id: user.id,
        otp_code: otp,
        otp_type: type,
        expires_at: { [Sequelize.Op.gt]: new Date() },
        is_verified: false,
      },
      order: [["createdAt", "DESC"]],
      limit: 1,
    });

    if (!otpRecord) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired OTP",
      });
    }

    // Mark OTP as verified
    await otpRecord.update({
      is_verified: true,
    });

    // Generate JWT token
    const token = generateToken(user.id);

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          mobileNumber: user.mobileNumber,
          isEmailVerified: type === "email" ? true : undefined,
          isMobileVerified: type === "mobileNumber" ? true : undefined,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to verify OTP",
    });
  }
};

//Logout : Logout user
exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(400).json({
        success: false,
        error: "No token provided",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to logout",
    });
  }
};

// Google Auth login logic: Handles Google Auth-based login.
exports.googleAuth = async (req, res) => {
  try {
    const { googleId } = req.body;
    const token = await authService.googleAuth(googleId);
    res.status(200).json({ token });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// Forgot password logic: Initiates password reset by sending OTP.
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found with this email address' 
      });
    }

    // Use your existing OTP controller to send OTP
    await otpController.sendOtp(req, res);
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Reset password logic: Resets user password using OTP verification.
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword, otp } = req.body;

    if (!email || !newPassword || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, new password, and OTP are required' 
      });
    }

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found with this email address' 
      });
    }

    // Create a custom request for OTP verification
    const otpReq = {
      body: { email, otp }
    };
    
    let otpVerified = false;
    const otpRes = {
      status: (code) => ({
        json: (data) => {
          if (code === 200) {
            otpVerified = true;
          }
          return otpRes;
        }
      })
    };

    // Verify OTP using your existing controller
    await otpController.verifyOtp(otpReq, otpRes);
    
    if (!otpVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP' 
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user's password
    await user.update({ password: hashedPassword });

    res.status(200).json({ 
      success: true, 
      message: 'Password reset successfully' 
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

exports.sendRegistrationOTP = async (req, res) => {
  try {
    const { type, value } = req.body;
    // First check if user already exists
    const existingUser = await User.findOne({ where: { [type]: value } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: `User with this ${type} already exists`,
      });
    }

    const existingEmail = await RegisterOTP.findOne({
      where: { identifier: value, identifier_type: type },
    });
    if (existingEmail) {
      // Delete any existing OTPs for this identifier
      await RegisterOTP.destroy({
        where: {
          identifier: value,
          identifier_type: type,
        },
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Send OTP via email or SMS
    if (type === "email") {
      await sendEmailOTP(value, otp); // send email OTP helper
    } else if (type === "mobileNumber") {
      await sendSMS(value, `Your OTP is: ${otp}`); // send SMS OTP helper
    }

    // Store OTP in registration_otps table
    await RegisterOTP.create({
      identifier: value,
      identifier_type: type,
      otp_code: otp,
      expires_at: expiresAt,
    });

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${value}`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to send OTP",
    });
  }
};

exports.verifyRegistrationOTP = async (req, res) => {
  try {
    const { type, value, otp } = req.body;
    const otps = otp.toString();
    // Find OTP record for email or mobile
    const otpRecord = await RegisterOTP.findOne({
      where: {
        identifier: value,
        identifier_type: type,
        otp_code: otps,
        expires_at: { [Sequelize.Op.gt]: new Date() }, // Check if not expired
        is_verified: false,
      },
      order: [["createdAt", "DESC"]], // Latest OTP first
      limit: 1,
    });

    if (!otpRecord) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired OTP",
      });
    }

    // Mark OTP as verified
    otpRecord.is_verified = true;
    await otpRecord.save();

    return res.status(200).json({
      success: true,
      data: {
        verified: true,
        type,
        value,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to verify OTP",
    });
  }
};

exports.register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      mobileNumber,
      password,
      age,
      country,
      state,
      city,
      address
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'All required fields must be provided'
      });
    }

    // Check if email is verified
    const verifiedEmail = await RegisterOTP.findOne({
      where: {
        identifier: email,
        identifier_type: 'email',
        is_verified: true
      }
    });

    if (!verifiedEmail) {
      return res.status(400).json({
        success: false,
        error: 'Email is not verified'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Parse address
    let addressObj = {
      area: '',
      city: '',
      state: '',
      pincode: ''
    };

    if (typeof address === 'string') {
      addressObj.pincode = address;
    } else if (typeof address === 'object' && address !== null) {
      addressObj = {
        area: address.area || '',
        city: address.city || '',
        state: address.state || '',
        pincode: address.pincode || ''
      };
    }

    // Create new user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      mobileNumber: mobileNumber || '',
      password: hashedPassword,
      age,
      country,
      state,
      city,
      address_area: addressObj.area,
      address_city: addressObj.city,
      address_state: addressObj.state,
      address_pincode: addressObj.pincode,
      is_email_verified: true,
      is_mobile_verified: false // Mobile verification removed
    });

    // Generate token
    const token = generateToken(newUser.id);

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          mobileNumber: newUser.mobileNumber,
          country: newUser.country,
          state: newUser.state,
          city: newUser.city
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to register user'
    });
  }
};
