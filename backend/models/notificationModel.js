var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;


//TODO: add match() validator to email
var NotificationSchema = new Schema({
    senderID        : { type: Schema.Types.ObjectId, ref: 'User' },
    receiverID      : { type: Schema.Types.ObjectId, ref: 'User' },
    eventID         : { type: String},
    message         : { type: String},
    icon            : { type: String},
    sentTime        : { type: Date},
    route           : { type: Array }, // Kept empty if the user is not an artist
    color           : { type: String }, // Kept empty if the user is not an artist

}, { strict: true }, { versionKey: false });


mongoose.model('Notification', NotificationSchema);