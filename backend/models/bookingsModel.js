var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

/**
 * Bookings Schema
 */
var BookingsSchema = new Schema({
    bookingType     : {type: String, required: true, lowercase: true}, // in {"arist-apply", "host-request"}
    hostUser        : {type: Schema.Types.ObjectId, ref: 'User' },
    performerUser   : {type: Schema.Types.ObjectId, ref: 'User' },
    eventEID        : {type: Schema.Types.ObjectId, ref: 'Events' },
    approved        : {type: Boolean, default: false}, // Approved is true when bookingType=artist-apply when a host has accepted an application from an artist. When bookingType=host-request it means the artist has agreed to the request from the host.
    artistApproved  : {type: Boolean, default: false},
    hostApproved    : {type: Boolean, default: false},
    currentPrice    : {type: Number, required: true},
    completed       : {type: Boolean, default: false} // Has the event had the 2 factor auth go through?
}, {strict: true});

mongoose.model('Bookings', BookingsSchema);
