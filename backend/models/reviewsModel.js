var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

/**
 * Review Schema
 */
var ReviewSchema = new Schema({
    title           : {type: String, required: true},
    text            : {type: String, required: true},
    rating          : {type: Number, required: true},
    toUser          : {type: Schema.Types.ObjectId, ref: 'User' },
    fromUser        : {type: Schema.Types.ObjectId, ref: 'User' },
    date            : {type: Date, default: Date.now},
    flagCount       : {type: Number, default: 0},
    booking           : {type: Schema.Types.ObjectId, ref: 'Bookings' },
}, {strict: true}, {versionKey: false});

mongoose.model('Review', ReviewSchema);