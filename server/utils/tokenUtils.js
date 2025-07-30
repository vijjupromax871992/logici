const jwt = require('jsonwebtoken');

exports.generateAccessToken = (userId, isAdmin = false) => {
  return jwt.sign({ userId, isAdmin }, process.env.JWT_SECRET, { expiresIn: '30m' });
};

exports.generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};
