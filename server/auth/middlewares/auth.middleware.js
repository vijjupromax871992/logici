// Location: src/auth/middlewares/auth.middleware.js
const { verifyToken } = require('../../utils/jwt'); // Import the verifyToken method

// Middleware to authenticate the token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
    return;
  }
};

// Middleware to validate user registration data
const validateRegistration = (req, res, next) => {
  const { 
    firstName, 
    lastName, 
    email, 
    password,
    age,
    country,
    state,
    city,
    address
  } = req.body;

  // Check required fields
  if (!firstName || !lastName || !email || !password) {
    res.status(400).json({ error: 'Required fields are missing' });
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: 'Invalid email format' });
    return;
  }

  // Validate age if provided
  if (age && (age < 18 || age > 100)) {
    res.status(400).json({ error: 'Age must be between 18 and 100' });
    return;
  }

  // Validate address if provided
  if (address) {
    const { pincode } = address;
    if (pincode && !/^\d{6}$/.test(pincode)) {
      res.status(400).json({ error: 'Invalid pincode format' });
      return;
    }
  }

  next();
};

module.exports = { authenticateToken, validateRegistration };