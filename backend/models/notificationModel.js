var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

/**
 * Notifiation Schema
 * 
 * public sender: User
    public receiver:User
    public event:Event
    message: string
    icon: string
    sentTime: Date;
    route: string[]
    color: string

 */
//TODO: add match() validator to email
var NotificationSchema = new Schema({
    sender          : { type: Schema.Types.ObjectId, ref: 'User' },
    received        : { type: Schema.Types.ObjectId, ref: 'User' },
    event           : { type: Schema.Types.ObjectId, ref: 'Events' },
    message         : { type: String},
    icon            : { type: String},
    sentTime        : { type: Date},
    route           : { type: Array }, // Kept empty if the user is not an artist
    color           : { type: String }, // Kept empty if the user is not an artist

}, { strict: true }, { versionKey: false });


mongoose.model('Notification', NotificationSchema);