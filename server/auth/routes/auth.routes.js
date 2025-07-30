// Location: src/auth/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const googleAuthController = require('../controllers/google.auth.controller');
const {validateRegistration,authenticateToken}  = require('../middlewares/auth.middleware')

// Routes for Authentication
router.post('/login', (req, res, next) => {
    next();
}, authController.login);

router.post('/send-otp', (req, res, next) => {
    next();
}, authController.sendOTP);

router.post('/verify-otp', (req, res, next) => {
    next();
}, authController.verifyOTP);

router.post('/logout', (req, res, next) => {
    next();
}, authenticateToken, authController.logout);

// Google OAuth routes
router.get('/google', (req, res) => googleAuthController.googleLogin(req, res));
router.get('/google/callback', (req, res) => googleAuthController.googleCallback(req, res));

// Test route to check Google OAuth configuration
router.get('/google/test-config', (req, res) => {
    const config = {
        clientIdExists: !!process.env.GOOGLE_CLIENT_ID,
        clientSecretExists: !!process.env.GOOGLE_CLIENT_SECRET,
        callbackUrlExists: !!process.env.GOOGLE_CALLBACK_URL,
        clientUrl: process.env.CLIENT_URL,
        callbackUrl: process.env.GOOGLE_CALLBACK_URL
    };
    res.json(config);
});

router.get('/google/config', (req, res) => {
    const config = {
        clientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
        redirectUri: 'https://logic-i.com/api/auth/google/callback',
        clientUrl: process.env.CLIENT_URL,
    };
    res.json(config);
});

router.post('/forgot-password', (req, res, next) => {
    next();
}, authController.forgotPassword);

router.post('/reset-password', (req, res, next) => {
    next();
}, authController.resetPassword);

// Route for sending email OTP for verification
router.post('/register/send-otp', (req, res, next) => {
    next();
}, authController.sendRegistrationOTP); 

// Route for sending mobile OTP for verification
router.post('/register/verify-otp', (req, res, next) => {
    next();
}, authController.verifyRegistrationOTP); 

//Routes for Registration
router.post('/register', (req, res, next) => {
    next();
},validateRegistration, authController.register);

// Route for refreshing the JWT token
router.post('/refresh-token', (req, res, next) => {
    next();
}, (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        return res.status(400).send('Refresh Token is required');
    }

    tokenUtils.refreshToken(refreshToken)
        .then(newToken => {
            res.status(200).json({ token: newToken });
        })
        .catch(err => {
            res.status(403).send('Invalid refresh token');
        });
});

module.exports = router;
