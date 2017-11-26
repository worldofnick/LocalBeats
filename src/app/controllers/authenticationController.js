'use strict';

var mongoose    = require('mongoose');
var jwt         = require('jsonwebtoken');
var bcrypt      = require('bcrypt');
var User        = mongoose.model('User');
var config      = require('../../../config.js');

exports.register = function (req, res) {
    var newUser = new User(req.body); //TODO: change it to User.create({}) to avoid adding extraneous payload?
    newUser.hash_password = bcrypt.hashSync(req.body.password, 10);   // save a hashed password to DB
    console.log(req.body);
    newUser.save(function (err, user) {  // callback function with err and success value
      if (err) {
        return res.status(400).send({
          message: err
        });
      } else {
        user.hash_password = undefined;
        // create a token
        var token = jwt.sign({
          user: {
            uid: user._id,
            name: user.name,
            email: user.email,
            created: user.created
          }
        },
          config.secret, {
            expiresIn: 86400 // expires in 24 hours
          }
        );
        return res.status(200).send({ auth: true, token: token, user: user });
      }
    });
  };
  
  /**
   * Tells who the user is based on the token provided in the 
   * x-access-token header of the GET request
   * @param {*} req - Contains the uid after decrypting the token provided 
   *                  by the client. If the token can't be verified, whoAmI
   *                  won't provide access
   * @param {*} res - Contains the result of the request
   */
  exports.whoAmI = function (req, res) {
    User.findById(req.uid, { hash_password: 0 }, function (err, user) {
      if (err) return res.status(500).send("There was a problem finding the user.");
      if (!user) return res.status(404).send("User not found).");
  
      return res.status(200).send(user);
    });
  };
  
  // The signIn handler handles the user authentication.
  //TODO: form validation if needed?
  exports.signIn = function (req, res) {
    User.findOne({ email: req.body.email }, function (err, user) {
      if (err) return res.status(500).send('Error on the sign-in server.');
      if (!user) return res.status(404).send('No such user (' + req.body.email + ') in the database...');
      if (!user.comparePassword(req.body.password)) return res.status(401).send({ auth: false, token: null });
      var token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 86400 // expires in 24 hours
      });
      user.hash_password = undefined;
      res.status(200).send({ auth: true, token: token, user: user });
    });
  };
  
  // This loginRequired handler checks if the user is signed in
  exports.loginRequired = function (req, res, next) {
    if (req.user) {
      next();
    } else {
      return res.status(401).json({ message: 'Unauthorized user!' });
    }
  };
  
  exports.logout = function (req, res) {
    res.status(200).send({ auth: false, token: null });
  };
  