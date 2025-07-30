const express = require('express');
const passport = require('passport');
const {
  completeRegistration,
  handleGoogleCallback,
} = require('../controllers/usersController'); 
const router = express.Router();

// Initiate Google OAuth Login
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Handle Google OAuth Callback
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: 'https://logic-i.com/?alert=You%20are%20not%20registered&popup=register' }), handleGoogleCallback);

// Logout Route
router.get('/logout', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://logic-i.com');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  req.logout(() => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging out.' });
      }
      res.clearCookie('connect.sid', { path: '/' });
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.redirect('https//logic-i.com');
    });
  });  
});

router.post('/auth/complete-registration', completeRegistration);

module.exports = router;
