/**
 * @file passport.js
 * @description Passport configuration for Google OAuth 2.0 authentication strategy.
 */

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

/**
 * Configure Google OAuth 2.0 Strategy for Passport.
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    /**
     * Google OAuth verify callback function.
     * Searches for existing user by googleId or email, updates or creates user, and passes to done callback.
     * 
     * @async
     * @param {string} accessToken - OAuth access token
     * @param {string} refreshToken - OAuth refresh token
     * @param {Object} profile - Google profile data
     * @param {Function} done - Passport completion callback
     * @returns {Promise<void>}
     */
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : '';

        // Try to find user by googleId
        let user = await User.findOne({ googleId });

        if (user) {
          return done(null, user);
        }

        // If not found by googleId, try to find by email
        if (email) {
          user = await User.findOne({ email });
          if (user) {
            user.googleId = googleId;
            if (!user.avatar && avatar) {
              user.avatar = avatar;
            }
            await user.save();
            return done(null, user);
          }
        }

        // If not found at all, create a new user with Google profile data
        user = await User.create({
          name: profile.displayName || 'Google User',
          email,
          googleId,
          avatar,
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

/**
 * Serialize user instance to store user ID in session.
 */
passport.serializeUser((user, done) => {
  done(null, user.id);
});

/**
 * Deserialize user by retrieving user object from database using stored user ID.
 */
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
