// utils/jwt.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'jwtsecret';

const generateToken = (userId, isAdmin = false) => {
  return jwt.sign({ userId, isAdmin }, JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

module.exports = {
  generateToken,
  verifyToken
};