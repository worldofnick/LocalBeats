var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

/**
 * User Schema
 */
//TODO: add match() validator to email
var UserSchema = new Schema({
    firstName    : {type: String, required: true},
    lastName     : {type: String, required: true},
    email        : {type: String, unique: true, lowercase: true, required: true},
    hashPassword : {type: String, required: true},
    birthday     : {type: Date},
    joinDate     : {type: Date, default: Date.now},
    profilePicID : {type: Number},
    soundcloudID : {type: String},
    spotifyID    : {type: String},
    likesGenres  : {type: Array}
}, {strict: true}, {versionKey: false});

/**
 * Compares the passed password to the hashed password in the 
 * DB and return the result
 */ 
UserSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.hashPassword);
};

mongoose.model('User', UserSchema);