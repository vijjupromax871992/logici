// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

function verifyAccessToken(req, res, next) {
  try {
    console.log('🔍 [Auth] verifyAccessToken called for:', req.path);
    
    const authHeader = req.headers.authorization;
    console.log('🔍 [Auth] Authorization header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [Auth] Token missing or malformed - no Bearer header');
      return res.status(401).json({ 
        success: false, 
        message: 'Token missing or malformed' 
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('🔍 [Auth] Extracted token:', token);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  
    console.log('✅ [Auth] Token decoded successfully:', decoded);
    
    // Include isAdmin in the request object
    req.user = { 
      id: decoded.userId,
      isAdmin: decoded.isAdmin 
    };
    req.userId = decoded.userId;
    
    console.log('✅ [Auth] Set req.user:', req.user);
    console.log('✅ [Auth] Set req.userId:', req.userId);
    
    next();
  } catch (error) {
    console.error('❌ [Auth] Token verification failed:', error.message);
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token',
      details: error.message  
    });
  }
}

// Middleware to authenticate the token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.isAdmin = decoded.isAdmin; // Add isAdmin to request
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

module.exports = {
  verifyAccessToken,
  authenticateToken
};