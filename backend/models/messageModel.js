var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

/**
 * Schema/Format of a single chat message
 */
var MessageSchema = new Schema({
    message         :   { type: String } ,
    from            :   { type: Schema.Types.ObjectId, ref: 'User' },
    to              :   { type: Schema.Types.ObjectId, ref: 'User' },
    senderUserID    :   { type: String },
    receiverUserID  :   { type: String },
    isRead          :   { type: Boolean, default: false },
    sentAt          :   { type: Date, default: Date.now }
}, {strict: true});

mongoose.model('Message', MessageSchema);
