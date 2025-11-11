// server/passport-setup.js
require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');

/*
 * serializeUser determines which data of the user object should be stored in the session.
 * We store just the user_id.
 */
passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

/*
 * deserializeUser is called on every request.
 * It takes the user_id from the session and uses it to fetch
 * the FULL user object from the database.
 * This full object is then attached to req.user.
 */
passport.deserializeUser(async (id, done) => {
  try {
    const result = await db.query('SELECT * FROM users WHERE user_id = $1', [id]);
    if (result.rows.length > 0) {
      done(null, result.rows[0]); // This is the full user object
    } else {
      done(new Error('User not found in session.'), null);
    }
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      const { id: googleId, displayName: fullName, emails } = profile;
      const email = emails[0].value;

      if (!email.endsWith('@itbhu.ac.in')) {
        return done(null, false, { message: 'Only @itbhu.ac.in emails are allowed.' });
      }

      try {
        let res = await db.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
        if (res.rows.length > 0) {
          return done(null, res.rows[0]);
        } else {
          res = await db.query(
            'INSERT INTO users (google_id, email, full_name, display_name) VALUES ($1, $2, $3, $3) RETURNING *',
            [googleId, email, fullName]
          );
          return done(null, res.rows[0]);
        }
      } catch (err) {
        return done(err, null);
      }
    }
  )
);