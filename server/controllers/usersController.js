const bcrypt = require('bcrypt');
const { User } = require('../models');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokenUtils');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

exports.getUserDetails = async (req, res) => {
  try {
    // Find user by primary key (id) using Sequelize
    const user = await User.findByPk(req.userId, {
      attributes: [
        'id', 
        'firstName', 
        'lastName', 
        'email', 
        'mobileNumber',
        'createdAt',
        'updatedAt',
        'country',
        'state',
        'city',
        'role_id',
        'google_id',
        'profilePhoto'
      ],
      raw: true // This returns a plain object instead of a Sequelize model instance
    });

    // If no user found
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Transform user data to match frontend expectations
    const transformedUser = {
      id: user.id,
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      mobile: user.mobileNumber,
      created_at: user.createdAt,
      last_login: user.updatedAt,
      is_google_auth: !!user.google_id,
      country: user.country,
      state: user.state,
      city: user.city,
      role_id: user.role_id,
      profilePhoto: user.profilePhoto
    };

    // Successfully return user details
    return res.status(200).json({
      success: true,
      data: transformedUser
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch user details',
      id: req.userId,
    });
  }
};

exports.updateUserDetails = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Update user data
    const updatedData = {
      firstName: req.body.firstName || user.firstName,
      lastName: req.body.lastName || user.lastName,
      country: req.body.country || user.country,
      state: req.body.state || user.state,
      city: req.body.city || user.city
    };
    
    // Handle profile photo upload
    if (req.file) {
      updatedData.profilePhoto = req.file.filename;
      
      // Delete old profile photo if exists
      if (user.profilePhoto && user.profilePhoto !== 'default.jpg') {
        try {
          const oldPhotoPath = path.join(__dirname, '../uploads', user.profilePhoto);
          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
          }
        } catch (err) {
        }
      }
    }
    
    await user.update(updatedData);
    
    // Transform updated user data to match frontend expectations
    const transformedUser = {
      id: user.id,
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      mobile: user.mobileNumber,
      created_at: user.createdAt,
      last_login: user.updatedAt,
      country: user.country,
      state: user.state,
      city: user.city,
      profilePhoto: user.profilePhoto
    };
    
    return res.status(200).json({
      success: true,
      data: transformedUser
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get all users - FIXED VERSION (removed duplicate)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    const users = await User.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ 
      success: true, 
      data: {
        rows: users.rows,
        count: users.count,
        totalPages: Math.ceil(users.count / parseInt(limit)),
        currentPage: parseInt(page)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users',
      error: error.message 
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    logger.error(`Error in getUserById: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, isAdmin } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Create update object with only provided fields
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (isAdmin !== undefined) updateData.isAdmin = isAdmin;

    await user.update(updateData);
    res.status(200).json({ 
      success: true, 
      data: { 
        id: user.id, 
        firstName: user.firstName, 
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin
      } 
    });
  } catch (error) {
    logger.error(`Error in updateUser: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.destroy();
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    logger.error(`Error in deleteUser: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
};

// Handle Google OAuth callback
exports.handleGoogleCallback = async (req, res) => {
  try {
    console.log('🔍 [OAuth] handleGoogleCallback started');
    console.log('🔍 [OAuth] req.user:', req.user);
    
    const { email, name } = req.user;
    
    if (!email) {
      console.log('❌ [OAuth] No email provided');
      return res.redirect('https://logic-i.com/?alert=Google login failed - no email provided&popup=register');
    }

    console.log('🔍 [OAuth] Looking for user with email:', email);
    // Check if user exists
    let user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log('❌ [OAuth] User not found in database');
      // User doesn't exist, redirect to registration
      return res.redirect(`https://logic-i.com/?alert=You are not registered&popup=register&google_email=${encodeURIComponent(email)}&google_name=${encodeURIComponent(name || '')}`);
    }

    console.log('✅ [OAuth] User found:', {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      isAdmin: user.isAdmin
    });

    // User exists, generate tokens
    const accessToken = generateAccessToken(user.id, user.isAdmin);
    const refreshToken = generateRefreshToken(user.id);
    
    console.log('✅ [OAuth] Tokens generated');
    console.log('🔍 [OAuth] AccessToken:', accessToken);

    // Update user's google_id if not set
    if (!user.google_id && req.user.id) {
      await user.update({ google_id: req.user.id });
      console.log('✅ [OAuth] Updated google_id for user');
    }

    // Prepare user data for frontend
    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobile: user.mobile,
      isAdmin: user.isAdmin,
      is_email_verified: user.is_email_verified,
      is_google_auth: true
    };

    console.log('✅ [OAuth] User data prepared:', userData);

    // Redirect to auth callback with token and user data
    const redirectPath = user.isAdmin ? '/admin/dashboard' : '/user/dashboard';
    const callbackUrl = `https://logic-i.com/auth/success?token=${accessToken}&user=${encodeURIComponent(JSON.stringify(userData))}&redirectPath=${redirectPath}`;
    
    console.log('✅ [OAuth] Redirecting to:', callbackUrl);
    return res.redirect(callbackUrl);

  } catch (error) {
    console.error('❌ [OAuth] Error in handleGoogleCallback:', error);
    logger.error(`Error in handleGoogleCallback: ${error.message}`);
    return res.redirect('https://logic-i.com/?alert=Authentication error occurred&popup=login');
  }
};

// Complete registration after Google OAuth
exports.completeRegistration = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      mobileNumber,
      country,
      state,
      city,
      password,
      confirmPassword,
      google_id
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !mobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing: firstName, lastName, email, mobileNumber'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Passwords do not match'
        });
      }
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      mobileNumber,
      country: country || null,
      state: state || null,
      city: city || null,
      password: hashedPassword,
      google_id: google_id || null,
      isAdmin: false
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.isAdmin);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Registration completed successfully',
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          mobileNumber: user.mobileNumber,
          isAdmin: user.isAdmin
        },
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    logger.error(`Error in completeRegistration: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};