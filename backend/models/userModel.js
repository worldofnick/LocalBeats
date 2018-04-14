var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

/**
 * User Schema
 */
//TODO: add match() validator to email
var UserSchema = new Schema({
    firstName     : {type: String, required: true},
    lastName      : {type: String, required: true},
    fullName      : {type: String},
    email         : {type: String, unique: true, lowercase: true, required: true},
    hashPassword  : {type: String},
    birthday      : {type: Date},
    joinDate      : {type: Date, default: Date.now},
    profilePicUrl : {type: String, default: 'https://www.vccircle.com/wp-content/uploads/2017/03/default-profile.png'},
    spotifyID     : {type: String},
    stripeAccountId  : {type: String},
    genres        : {type: Array}, // Kept empty if the user is not an artist
    eventTypes    : {type: Array}, // Kept empty if the user is not an artist
    isArtist      : {type: Boolean, default: false},
    isOnline      : {type: Boolean, default: false},
    city          : {type: String, default: ''},
    averageRating : {type: Number, default: 0},
    state         : {type: String, default: ''},
    location: {
        type: [Number],  // [<longitude>, <latitude>]
        index: '2d'      // create the geospatial index
      },
    google: {
        id              : { type: String }
    },
    spotify: {
        id              : { type: String },
        email           : { type: String, lowercase: true },
        uri             : { type: String },
        href            : { type: String },
        refreshToken    : { type: String },
        accessToken     : { type: String }
    },
    soundcloud: {
        id              : { type: String },
        username        : { type: String },
        avatar_url      : { tyep: String }
    }
}, {strict: true}, {versionKey: false});

/**
 * Compares the passed password to the hashed password in the 
 * DB and return the result
 */ 
UserSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.hashPassword);
};

mongoose.model('User', UserSchema);