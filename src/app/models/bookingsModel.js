var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

/**
 * Bookings Schema
 */

// TODO
var BookingsSchema = new Schema({
    hostUID         : {type: String, required: true},
    performerUID    : {type: String, required: true},
    eventEID        : {type: String, required: true}
}, {strict: true});

mongoose.model('Bookings', BookingsSchema);
