var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;


/**
 * User Schema
 */
var UserSchema = new Schema({
    // name: {
    //     tyep:String,
    //     required: true
    // },
    // email: {
    //   type: String,
    //   unique: true,
    //   lowercase: true,
    //   trim: true,
    //   required: true
    // },
    // hash_password: {
    //   type: String,
    //   required: true
    // },
    // created: {
    //   type: Date,
    //   default: Date.now
    // }
    name: String,
    email: String,
    hash_password: String,
    created: {type: Date, default: Date.now}
}, {strict: true});
  
UserSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.hash_password);
};

mongoose.model('User', UserSchema);