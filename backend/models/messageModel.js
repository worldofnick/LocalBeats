var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

/**
 * Schema/Format of a single chat message
 */
var MessageSchema = new Schema({
    content         :   { type: String } ,
    from            :   { type: Schema.Types.ObjectId, ref: 'User' },
    to              :   { type: Schema.Types.ObjectId, ref: 'User' },
    isRead          :   { type: Boolean, default: false },
    sentAt          :   { type: Date, default: Date.now },
    messageType     :   { type: String, default: 'MSG'},        // Others include: ADMIN, FILE, OTHER (see messageTypes.ts)
    attachmentURL   :   { type: String}
}, {strict: true});

mongoose.model('Message', MessageSchema);
