// Debug OAuth callback to check token generation
require('dotenv').config();
const { User } = require('./models');
const { generateAccessToken } = require('./utils/tokenUtils');

async function testOAuthCallback() {
  try {
    // Find the admin user by email
    const email = 'vijay871992.logic.i@gmail.com';
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('User found:');
    console.log('- ID:', user.id);
    console.log('- Email:', user.email);
    console.log('- Name:', user.firstName, user.lastName);
    console.log('- isAdmin:', user.isAdmin);
    
    // Generate tokens like in the OAuth callback
    const accessToken = generateAccessToken(user.id, user.isAdmin);
    console.log('\nGenerated token:', accessToken);
    
    // Decode to verify
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(accessToken);
    console.log('Decoded payload:', JSON.stringify(decoded, null, 2));
    
    // Test the URL that would be generated
    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobile: user.mobile,
      isAdmin: user.isAdmin,
      is_email_verified: user.is_email_verified,
      is_google_auth: true
    };
    
    const redirectPath = user.isAdmin ? '/admin/dashboard' : '/user/dashboard';
    const callbackUrl = `https://logic-i.com/auth/success?token=${accessToken}&user=${encodeURIComponent(JSON.stringify(userData))}&redirectPath=${redirectPath}`;
    
    console.log('\nCallback URL would be:');
    console.log(callbackUrl);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testOAuthCallback().then(() => process.exit(0));