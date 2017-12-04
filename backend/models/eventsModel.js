var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

/**
 * Events Schema
 */
var EventsSchema = new Schema({
    eventName       : {type: String, required: true},
    eventType       : {type: String, required: true},
    eventGenre      : {type: String, required: true},
    hostUID         : {type: String, required: true},
    hostEmail       : {type: String, lowercase: true, required: true},
    performerUID    : {type: String},
    performerEmail  : {type: String, lowercase: true},
    address         : {type: String},
    fromDate        : {type: Date, default: Date.now},
    toDate          : {type: Date},
    description     : {type: String},
    fixedPrice      : {type: Number},
    hourlyRate      : {type: Number},
    deposit         : {type: Number},
    isBooked        : {type: Boolean, default: false},
    location: {
      type: [Number],  // [<longitude>, <latitude>]
      index: '2d'      // create the geospatial index
    }
}, {strict: true});

/**
 * Compares the passed password to the hashed password in the
 * DB and return the result
 */
// UserSchema.methods.comparePassword = function(password) {
//     return bcrypt.compareSync(password, this.hash_password);
// };

mongoose.model('Events', EventsSchema);
