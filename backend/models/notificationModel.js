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
var NotificationScheme = new Schema({
    sender          : { type: Schema.Types.ObjectId, ref: 'User' },
    sreceived       : { type: Schema.Types.ObjectId, ref: 'User' },
    event           : { type: Schema.Types.ObjectId, ref: 'Events' },
    message         : { type: String, required: true },
    icon            : { type: String, required: true },
    sentTime        : { type: Date, required: true },
    route           : { type: Array }, // Kept empty if the user is not an artist
    color           : { type: String }, // Kept empty if the user is not an artist

}, { strict: true }, { versionKey: false });


mongoose.model('User', UserSchema);