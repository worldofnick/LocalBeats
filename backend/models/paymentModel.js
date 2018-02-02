var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

/**
 * Payment Schema
 */
 var PaymentsSchema = new Schema({
     hostUser        : {type: Schema.Types.ObjectId, ref: 'User', required: true},
     performerUser   : {type: Schema.Types.ObjectId, ref: 'User' },
     event           : {type: Schema.Types.ObjectId, ref: 'Events' },
     amount          : {type: Number},
     date:           : {type : Date},
     stripeChargeId  : {type: String},
     type            : {type: String} // {"payment", "refund"}
 }, {strict: true});


mongoose.model('Payments', PaymentsSchema);