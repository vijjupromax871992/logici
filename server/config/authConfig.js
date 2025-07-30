const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
//const db = require('./database');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      const email = profile.emails && profile.emails[0] && profile.emails[0].value;
      const name = profile.displayName;

      // Pass essential user details
      return done(null, { email, name });
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = passport;
