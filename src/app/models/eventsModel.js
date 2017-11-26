var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

/**
 * Events Schema
 */
var EventsSchema = new Schema({
    eventName: {type: String, required: true},
    hostEmail: {type: String, unique: true, lowercase: true, required: true},
    performerEmail: {type: String, unique: true, lowercase: true, required: true},
    address: {type: String},
    fromDate: {type: Date, defauly: Date.now},
    toDate: {type: Date},
    description:{type: String},
    fixedPrice: {type: Number},
    hourlyRate: {type: Number},
    deposit: {type: Number},
}, {strict: true});

/**
 * Compares the passed password to the hashed password in the 
 * DB and return the result
 */ 
UserSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.hash_password);
};

mongoose.model('Events', EventsSchema);