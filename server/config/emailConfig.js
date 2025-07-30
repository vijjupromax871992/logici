const nodemailer = require('nodemailer');
require('dotenv').config();

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSKEY) {
}

// Debug logging

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSKEY // use app-specific password for Gmail
//   }
// });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSKEY
  },
  debug: true // Enable debug logging
});


// Verify the connection configuration
transporter.verify(function(error, success) {
  if (error) {
  } else {
  }
});

module.exports = transporter;