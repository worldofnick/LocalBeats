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
    eventEID        : {type: String, required: true},
    fromDate        : {type: Date, default: Date.now},
    toDate          : {type: Date},
    completed       : {type: Boolean, default: false} // Has the event had the 2 factor auth go through?
}, {strict: true});

mongoose.model('Bookings', BookingsSchema);
