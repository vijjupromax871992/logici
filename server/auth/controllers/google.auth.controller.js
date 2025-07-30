// src/auth/controllers/google.auth.controller.js
const { OAuth2Client } = require('google-auth-library');
const { generateToken } = require('../../utils/jwt');
const User = require('../../models/User');
const { Sequelize } = require('sequelize');  
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '../../.env' }); 


// Verify environment variables
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL;
const CLIENT_URL = process.env.CLIENT_URL || 'https://logic-i.com';
const SERVER_URL = process.env.SERVER_URL || 'https://logic-i-backend.onrender.com';

if (!googleClientId || !googleClientSecret || !googleCallbackUrl) {
    throw new Error('Missing required Google OAuth environment variables');
}

// Initialize OAuth client
const client = new OAuth2Client({
    clientId: googleClientId,
    clientSecret: googleClientSecret,
    redirectUri: googleCallbackUrl
});

exports.googleLogin = (req, res) => {
    try {
        const authUrl = client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email'
            ],
            prompt: 'consent'
        });
        res.redirect(authUrl);
    } catch (error) {
        res.redirect(`${CLIENT_URL}/auth/error?error=oauth_init_failed`);
    }
};

exports.googleCallback = async (req, res) => {
    try {
        console.log('🔍 [GoogleOAuth] googleCallback started');
        console.log('🔍 [GoogleOAuth] req.query.code:', !!req.query.code);
        
        if (!req.query.code) {
            console.log('❌ [GoogleOAuth] No authorization code received');
            throw new Error('No authorization code received');
        }

        // Get tokens from Google
        const { tokens } = await client.getToken(req.query.code);
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: googleClientId
        });

        const payload = ticket.getPayload();
        console.log('🔍 [GoogleOAuth] Google payload email:', payload.email);
        
        // Check if user exists
        const user = await User.findOne({
            where: {
                email: payload.email
            }
        });

        if (!user) {
            console.log('❌ [GoogleOAuth] User not found in database');
            // User not registered - redirect to register page with error
            return res.redirect(`${CLIENT_URL}?showRegister=true&googleEmail=${payload.email}`);
        }

        console.log('✅ [GoogleOAuth] User found:', {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            isAdmin: user.isAdmin
        });

        // Generate JWT token with isAdmin field
        const token = generateToken(user.id, user.isAdmin);
        console.log('✅ [GoogleOAuth] Token generated with isAdmin:', user.isAdmin);
        console.log('🔍 [GoogleOAuth] Token:', token);

        // Transform user data to match frontend expectations
        const userData = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            mobile: user.mobileNumber,
            isAdmin: user.isAdmin, // Make sure this field is included
            is_email_verified: true,
            is_google_auth: true
        };

        console.log('✅ [GoogleOAuth] User data prepared:', userData);

        // Determine redirect path based on user role
        const redirectPath = userData.isAdmin ? '/admin/dashboard' : '/user/dashboard';
        console.log('🔍 [GoogleOAuth] Redirect path:', redirectPath);

        // Store auth data in session or cookies for the frontend to retrieve
        // First redirect to auth callback route with token and user info
        const redirectUrl = new URL('/auth/success', CLIENT_URL);
        redirectUrl.searchParams.set('token', token);
        redirectUrl.searchParams.set('user', JSON.stringify(userData));
        redirectUrl.searchParams.set('redirectPath', redirectPath);
        
        console.log('✅ [GoogleOAuth] Redirecting to:', redirectUrl.toString());
        res.redirect(redirectUrl.toString());

    } catch (error) {
        console.error('❌ [GoogleOAuth] Error:', error.message);
        res.redirect(`${CLIENT_URL}/auth/error?error=${encodeURIComponent(error.message)}`);
    }
};

// Config test routes
exports.testConfig = (req, res) => {
    const config = {
        clientIdExists: !!process.env.GOOGLE_CLIENT_ID,
        clientSecretExists: !!process.env.GOOGLE_CLIENT_SECRET,
        callbackUrlExists: !!process.env.GOOGLE_CALLBACK_URL,
        clientUrl: process.env.CLIENT_URL,
        callbackUrl: process.env.GOOGLE_CALLBACK_URL
    };
    res.json(config);
};

exports.getConfig = (req, res) => {
    const config = {
        clientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
        redirectUri: 'https://logic-i-backend.onrender.com/api/auth/google/callback',
        clientUrl: process.env.CLIENT_URL,
    };
    res.json(config);
};