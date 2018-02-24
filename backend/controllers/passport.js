const mongoose          = require('mongoose');
const passport          = require('passport');
const JwtStrategy       = require('passport-jwt').Strategy;
const { ExtractJwt }    = require('passport-jwt');
const LocalStrategy     = require('passport-local').Strategy;
const User              = mongoose.model('User');
const config            = require('../../config.js');

/**
 * JSON Web Tokens strategy
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