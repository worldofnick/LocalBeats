const mongoose          = require('mongoose');
const passport          = require('passport');
const JwtStrategy       = require('passport-jwt').Strategy;
const { ExtractJwt }    = require('passport-jwt');
const LocalStrategy     = require('passport-local').Strategy;
const User              = mongoose.model('User');
const config            = require('../../config.js');

exports.verifyJWTWithPassport = passport.authenticate('jwt', { session: false });

/**
 * JSON Web Tokens strategy
 * If the token is verified successfully, the user object can be 
 * obtained from req.user in the subseqeuent middlewares or handlers
 */
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromHeader('x-access-token'),
    secretOrKey: config.JWT_SECRET
}, async (payload, done) => {
    try {
        console.log('In here: ', payload);
        // Find the user specified in token
        User.findById(payload.user.uid, function (err, user) {    //TODO: change it to user.uid based on what on frontend. Or change front end to sub
            if (err) {
                console.log("Error in JWT: ", err);
                done(error, false);
            }
            // If user doesn't exists, handle it
            if (!user) {
                return done(null, false);
            }
            console.log("JWT user: ", user);
            // Otherwise, return the user. Referenced by req.user
            done(null, user);
        });
    }
    catch (error) {
        done(error, false);
    }
}));

/**
 * Local login strategy
 */
passport.use(new LocalStrategy({
    usernameField: 'email'
}, async (email, password, done) => {
    //   console.log('In local: ', email);
    try {
        // Find the user given the email
        User.findOne({ email: email }, function (err, foundUser) {
            console.log('Found User: ', foundUser);
            // If no user found, handle it
            if (!foundUser) {
                return done(null, false);
            }

            // Verify password. If incorrect, handle it. 
            // Else return the user
            if (!foundUser.comparePassword(password)) {
                return done(null, false);
            }
            done(null, foundUser);
        });
    } catch (error) {
        done(error, false);
    }
}));
