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
    typeIsAttachment:   { type: Boolean, default: false},
    attachmentURL   :   { type: String, default: ""}
}, {strict: true});

mongoose.model('Message', MessageSchema);
