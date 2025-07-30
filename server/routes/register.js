const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const { User } = require('../models');
const { sendSMS } = require('../utils/otpUtils');
const router = express.Router();

// Registration Endpoint
// router.post(
//   '/register',
//   [
//     body('firstName').notEmpty().withMessage('First name is required'),
//     body('lastName').notEmpty().withMessage('Last name is required'),
//     body('email').isEmail().withMessage('Valid email is required'),
//     body('mobileNumber')
//       .isMobilePhone()
//       .withMessage('Valid mobile number is required'),
//     body('password')
//       .isLength({ min: 6 })
//       .withMessage('Password must be at least 6 characters long'),
//     body('confirmPassword')
//       .custom((value, { req }) => value === req.body.password)
//       .withMessage('Passwords must match'),
//     body('country').notEmpty().withMessage('Country is required'),
//     body('state').notEmpty().withMessage('State is required'),
//     body('city').notEmpty().withMessage('City is required'),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     try {
//       const { firstName, lastName, email, mobileNumber, password, country, state, city } = req.body;

//       // Check OTP verification
//       const otpCheck = await req.db.query(
//         'SELECT * FROM otps WHERE identifier = ? AND expires_at > NOW()',
//         {
//           replacements: [mobileNumber],
//           type: req.db.QueryTypes.SELECT,
//         }
//       );

//       if (otpCheck.length === 0) {
//         return res.status(400).json({ message: 'Mobile number is not verified' });
//       }

//       // Check if user already exists
//       const existingUser = await User.findOne({ where: { email } });
//       if (existingUser) {
//         return res.status(400).json({ message: 'Email already in use' });
//       }

//       // Hash password
//       const hashedPassword = await bcrypt.hash(password, 10);

//       // Create new user
//       const newUser = await User.create({
//         firstName,
//         lastName,
//         email,
//         mobileNumber,
//         password: hashedPassword,
//         country,
//         state,
//         city,
//       });

//       // Delete OTP after successful registration
//       await req.db.query('DELETE FROM otps WHERE identifier = ?', {
//         replacements: [mobileNumber],
//         type: req.db.QueryTypes.DELETE,
//       });

//       res.status(201).json({ message: 'User registered successfully', user: newUser });
//     } catch (error) {
//       res.status(500).json({ message: 'Server error' });
//     }
//   }
// );


module.exports = router;
