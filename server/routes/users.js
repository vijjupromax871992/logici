// routes/users.js
const express = require('express');
const { verifyAccessToken, authenticateToken } = require('../middleware/authMiddleware');
const { User } = require('../models'); 
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserDetails,
  updateUserDetails
} = require('../controllers/usersController');

const router = express.Router();

// Configure multer for file uploads

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// Configure file filter
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// User routes
router.get('/api/users', getAllUsers);
router.get('/api/users/:id', getUserById);
router.put('/api/users/:id', updateUser);
router.delete('/api/users/:id', deleteUser);

// Route for fetching the logged-in user's data
router.get('/api/user', verifyAccessToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, { attributes: { exclude: ['password'] } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Protected route to get current user's details
router.get('/me', authenticateToken, getUserDetails);
router.put('/me', authenticateToken, upload.single('profilePhoto'), updateUserDetails);

module.exports = router;
