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
    fromUser        : {type: String, required: true},
    toUser          : {type: Schema.Types.ObjectId, ref: 'User' },
    toUser          : {type: Schema.Types.ObjectId, ref: 'User' },
    event           : {type: Schema.Types.ObjectId, ref: 'Events' },
    date            : {type: Date, default: Date.now},
    flagCount       : {type: Number, default: 0}
}, {strict: true}, {versionKey: false});

mongoose.model('Review', ReviewSchema);
