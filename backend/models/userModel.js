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
    email         : {type: String, unique: true, lowercase: true, required: true},  // Local email
    hashPassword  : {type: String, required: true},
    birthday      : {type: Date},
    joinDate      : {type: Date, default: Date.now},
    profilePicUrl : {type: String, default: 'https://www.vccircle.com/wp-content/uploads/2017/03/default-profile.png'},
    soundcloudID  : {type: String}, //TODO: remove later
    spotifyID     : {type: String}, //TODO: remove later
    stripeAccountId  : {type: String},
    genres        : {type: Array}, // Kept empty if the user is not an artist
    eventTypes    : {type: Array}, // Kept empty if the user is not an artist
    isArtist      : {type: Boolean, default: false},
    isOnline      : {type: Boolean, default: false},
    city          : {type: String, default: ''},
    state         : {type: String, default: ''},
    location: {
        type: [Number],  // [<longitude>, <latitude>]
        index: '2d'      // create the geospatial index
    },
    google: {
        id: {
          type: String
        },
        email: {
          type: String,
          lowercase: true
        }
    },
    facebook: {
        id: {
          type: String
        },
        email: {
          type: String,
          lowercase: true
        }
    },
    twitter: {
        id: {
          type: String
        },
        email: {
          type: String,
          lowercase: true
        }
    },
    soundcloud: {
        id: {
          type: String
        },
        email: {
          type: String,
          lowercase: true
        }
    },
    spotify: {
        id: {
          type: String
        },
        email: {
          type: String,
          lowercase: true
        }
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