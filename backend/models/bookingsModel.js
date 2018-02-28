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
    artViewed       : {type: Boolean, default: false},
    hostViewed      : {type: Boolean, default: false},
    hostStatusMessage   : {type: String, default: ''},
    artistStatusMessage : {type: String, default: ''},
    artistApproved  : {type: Boolean, default: false},
    hostApproved    : {type: Boolean, default: false},
    currentPrice    : {type: Number, required: true},
    hostVerified    : {type: Boolean, default: null},
    artistVerified  : {type: Boolean, default: null},
    hostComment     : {type: String, default: ''},
    artistComment   : {type: String, default: ''},
    completed       : {type: Boolean, default: false},
    cancelled       : {type: Boolean, default: false},
    beenReviewedByArtist     : {type: Boolean, default: false},
    beenReviewedByHost       : {type: Boolean, default: false},
    bothReviewed       : {type: Boolean, default: false}



}, {strict: true});

mongoose.model('Bookings', BookingsSchema);
