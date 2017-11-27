var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

/**
 * Bookings Schema
 */

// TODO
var BookingsSchema = new Schema({
    eventName       : {type: String, required: true},
    hostUID         : {type: String, required: true},
    hostEmail       : {type: String, lowercase: true, required: true},
    performerEmail  : {type: String, lowercase: true, required: true},
    address         : {type: String},
    fromDate        : {type: Date, default: Date.now},
    toDate          : {type: Date},
    description     : {type: String},
    fixedPrice      : {type: Number},
    hourlyRate      : {type: Number},
    deposit         : {type: Number},
    isBooked          : {type: Boolean}
}, {strict: true});

mongoose.model('Bookings', BookingsSchema);
