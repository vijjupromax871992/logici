// middleware/adminMiddleware.js
const { User } = require('../models');

const isAdmin = async (req, res, next) => {
  try {
    console.log('🔍 [AdminMiddleware] isAdmin called for:', req.path);
    console.log('🔍 [AdminMiddleware] req.userId:', req.userId);
    console.log('🔍 [AdminMiddleware] req.user:', req.user);
    
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      console.log('❌ [AdminMiddleware] User not found in database');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ [AdminMiddleware] User found:', {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin
    });

    // Check if user has admin role
    if (!user.isAdmin) {
      console.log('❌ [AdminMiddleware] User is not admin');
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    console.log('✅ [AdminMiddleware] Admin access granted');
    // Add admin user to request object
    req.admin = user;
    next();
  } catch (error) {
    console.error('❌ [AdminMiddleware] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = { isAdmin };