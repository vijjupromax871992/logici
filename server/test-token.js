// Test script to verify token generation
require('dotenv').config();
const { generateAccessToken } = require('./utils/tokenUtils');

console.log('Testing token generation...');
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

// Test with admin user
const adminToken = generateAccessToken('test-user-id', true);
console.log('\nAdmin token generated:', adminToken);

// Decode to verify
const jwt = require('jsonwebtoken');
const decoded = jwt.decode(adminToken);
console.log('Decoded payload:', JSON.stringify(decoded, null, 2));

// Test with regular user
const userToken = generateAccessToken('test-user-id', false);
console.log('\nUser token generated:', userToken);
const decodedUser = jwt.decode(userToken);
console.log('Decoded user payload:', JSON.stringify(decodedUser, null, 2));