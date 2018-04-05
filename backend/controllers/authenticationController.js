'use strict';

var mongoose    = require('mongoose');
var jwt         = require('jsonwebtoken');
var bcrypt      = require('bcrypt');
var User        = mongoose.model('User');
var config    = require('../../config.js');

exports.register = function (req, res) {
    var newUser = new User(req.body);
    newUser.hashPassword = bcrypt.hashSync(req.body.password, 10);   // save a hashed password to DB
    if(newUser._id == null) {
      newUser._id = undefined;
    }
    if(newUser.spotifyID == null) {
      newUser.spotifyID = undefined;
    }
    newUser.isOnline = true;
    
    newUser.save(function (err, user) {  // callback function with err and success value
      if (err) {
        return res.status(400).send({
          message: "Unable to save the user...",
          error: err
        });
      } else {
        user.hashPassword = undefined;
        user.__v = undefined;
        // create a token
        var token = jwt.sign({ id: user._id },
          config.secret, {
            expiresIn: 86400 // expires in 24 hours
          }
        );

        User.findByIdAndUpdate(user._id, {isOnline: true}, {new: true}, function (err, authUser) {
          if (err) {
            console.log('Cant chnage online status (sign up)...');
          }
          authUser.hashPassword = undefined;
        });

        return res.status(200).send({ auth: true, token: token, user: user });
      }
    });
  };

  /**
   * Function that handles password change.
   * @param {*} req : {user: {<user_object>}, newPassword: "<pass>"}
   * @param {*} res : The user object
   */
  exports.changePassword = function (req, res) {
    var oldUser = new User(req.body.user);

    // var newUser = new User(req.body.user);
    var newHashPassword = bcrypt.hashSync(req.body.newPassword, 10);
    
    User.findByIdAndUpdate(req.params.uid, { hashPassword: newHashPassword}, { new: true }, function (err, user) {
      if (err) return res.status(500).send("There was a problem updating the password.");
      user.hashPassword = undefined;
      return res.status(200).send( { user: user });
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
    User.findById(req.uid, { hashPassword: 0 }, function (err, user) {
      if (err) return res.status(500).send("There was a problem finding the user.");
      if (!user) return res.status(404).send("User not found (try logging in first).");
  
      return res.status(200).send(user);
    });
  };
  
  /**
   * The handler handles the user authentication.
   */ 
  exports.signIn = function (req, res) {
    User.findOne({ email: req.body.email }, function (err, user) {
      if (err) return res.status(500).send('Error on the sign-in server.');
      if (!user) return res.status(404).send('No such user (' + req.body.email + ') in the database...');
      if (!user.comparePassword(req.body.password)) return res.status(401).send({ auth: false, token: null });
      var token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 86400 // expires in 24 hours
      });
      user.hashPassword = undefined;

      User.findByIdAndUpdate(user._id, {isOnline: true}, {new: true}, function (err, authUser) {
        if (err) {
          console.log('Cant chnage online status (auth controller)...');
        }
        authUser.hashPassword = undefined;
        console.log('Authenticated user: ', authUser);
      });

      res.status(200).send({ auth: true, token: token, user: user });
    });
  };

  exports.sendMagicLink = function (req, res) {
    res.status(200).send( { email: req.body.email, message: 'Not Implemented' } );
  }
  
  /**
   * This handler checks if the user is signed in. If it is, 
   * passes the control to the next in line. Else, breaks the 
   * control.
   */ 
  exports.loginRequired = function (req, res, next) {
    if (req.user) {
      next();
    } else {
      return res.status(401).json({ message: 'Unauthorized user!' });
    }
  };
  
  /**
   * Dummy handler that sets the JWT token to null
   * @param {*} req 
   * @param {*} res 
   */
  exports.logout = function (req, res) {
    User.findByIdAndUpdate(req.body._id, {isOnline: false}, {new: true}, function (err, authUser) {
      if (err) {
        console.log('Cant chnage online status (logout controller)...');
      }
      authUser.hashPassword = undefined;
      console.log('Logged out user: ', authUser);
    });

    res.status(200).send({ auth: false, token: null });
  };
  