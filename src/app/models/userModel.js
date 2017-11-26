var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

/**
 * set up a mongoose model
 * email is unique
 */ 
module.exports = mongoose.model('Users', new Schema({ 
    first_name: {
        String,
	email: String, 
	password: String, 
	admin: Boolean 
}));