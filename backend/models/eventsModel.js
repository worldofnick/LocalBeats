var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

/**
 * Events Schema
 */
var EventsSchema = new Schema({
    eventName       : {type: String, required: true},
    eventType       : {type: String, required: true, lowercase: true},
    eventGenres     : {type: Array, required: true, lowercase: true},
    hostUser        : {type: Schema.Types.ObjectId, ref: 'User', required: true},
    performerUser   : {type: Schema.Types.ObjectId, ref: 'User' },
    address         : {type: String},
    street          : {type: String},
    city            : {type: String},
    state           : {type: String},
    zip             : {type: String},
    fromDate        : {type: Date},
    toDate          : {type: Date},
    description     : {type: String},
    fixedPrice      : {type: Number},
    negotiable      : {type: Boolean, default: false},
    hourlyRate      : {type: Number},
    deposit         : {type: Number},
    isBooked        : {type: Boolean, default: false},
    eventPicUrl     : {type: String},
    open            : {type: Boolean, default: true},
    cancellationPolicy    : {type: String, default: 'flexible'},
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
