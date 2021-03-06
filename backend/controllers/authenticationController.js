'use strict';

var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const mailer = require('../misc/mailer');
const request = require('request');
const socketServer = require('../socket/chatSocket');

var User = mongoose.model('User');
var config = require('../../config.js');

exports.register = function (req, res) {
  var newUser = new User(req.body);
  newUser.hashPassword = bcrypt.hashSync(req.body.password, 10);   // save a hashed password to DB
  if (newUser._id == null) {
    newUser._id = undefined;
  }
  if (newUser.spotifyID == null) {
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
      user.__v = undefined;
      // create a token
      var token = jwt.sign({ id: user._id },
        config.secret, {
          expiresIn: 86400 // expires in 24 hours
        }
      );
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

  User.findByIdAndUpdate(req.params.uid, { hashPassword: newHashPassword }, { new: true }, function (err, user) {
    if (err) return res.status(500).send("There was a problem updating the password.");
    user.hashPassword = undefined;
    return res.status(200).send({ user: user });
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
  User.findById(req.uid, function (err, user) {
    if (err) return res.status(500).send("There was a problem finding the user.");
    if (!user) return res.status(404).send("User not found (try logging in first).");

    return res.status(200).send(user);
  });
};

/**
 * The handler handles the user authentication.
 */
exports.signInDemoMode = function (req, res) {
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) return res.status(500).send('Error on the sign-in server.');
    if (!user) return res.status(404).send('No such user (' + req.body.email + ') in the database...');
    if (!user.comparePassword(req.body.password)) {
      return res.status(401).send('Incorrect password');
    }
    var token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 86400 // expires in 24 hours
    });
    // user.hashPassword = undefined;

    User.findByIdAndUpdate(user._id, { isOnline: true }, { new: true }, function (err, authUser) {
      if (err) {

      }
      authUser.hashPassword = undefined;
    });

    res.status(200).send({ auth: true, token: token, user: user });
  });
};

exports.demiSignIn = function (req, res) {
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) return res.status(500).send('Error on the sign-in server.');
    if (!user) return res.status(404).send('No such user (' + req.body.email + ') in the database...');
    var token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 86400 // expires in 24 hours
    });
    // user.hashPassword = undefined;

    User.findByIdAndUpdate(user._id, { isOnline: true }, { new: true }, function (err, authUser) {
      if (err) {

      }
      authUser.hashPassword = undefined;
    });

    res.status(200).send({ auth: true, token: token, user: user });
  });
};

exports.sendMagicLink = function (req, res) {
  const receivedEmail = req.body.email;
  // Find the user with the requested email
  User.findOne({ email: req.body.email }, function (err, foundUser) {
    if (err) {
      return res.status(500).send('Error on the sign-in server.');
    }
    if (!foundUser) {
      return res.status(404).send('No such user (' + req.body.email + ') in the database...');
    }
    if (!foundUser.comparePassword(req.body.password)) {
      return res.status(401).send('Incorrect password');
    }

    // If the user's found, generate a JWT token with its uid
    let localAccessToken = jwt.sign({ id: foundUser._id }, config.secret, {
      expiresIn: 86400 // expires in 24 hours
    });

    // foundUser.hashPassword = undefined;

    // Send email with JWT link
    const sameTabUrl = config.local.authSameTabUri + localAccessToken;
    let message = {
      from: 'auth@localBeats.com',
      to: foundUser.email,
      subject: 'localBeats Password-less Login Magic Link',
      text: 'Hello, ' + foundUser.firstName,
      html: '<p><b>Hello, ' + foundUser.firstName + '!<br>' +
        '<br>Click this link to get verified and continue your session: <br><br>' +
        sameTabUrl +
        '<br><br>Thanks'
    };

    mailer.sendEmail(message.from, message.to, message.subject, message.html)
      .then(data => {
        res.status(200).send({ user: foundUser, message: 'Magic link sent!' });
      }, error => {
        res.status(520).send('Unable to send the email... Try again later');
      });
  });
}

exports.sendResetPasswordLink = function (req, res) {
  const receivedEmail = req.body.email;
  // Find the user with the requested email
  User.findOne({ email: req.body.email }, function (err, foundUser) {
    if (err) {
      return res.status(500).send('Error on the sign-in server.');
    }
    if (!foundUser) {
      return res.status(404).send('No such user (' + req.body.email + ') in the database...');
    }

    // If the user's found, generate a JWT token with its uid
    let localAccessToken = jwt.sign({ id: foundUser._id }, config.secret, {
      expiresIn: 86400 // expires in 24 hours
    });

    // Send email with JWT link
    const callbackUrl = config.local.authCallbackUri + localAccessToken;
    const sameTabUrl = config.local.authSameTabUri + localAccessToken;
    let message = {
      from: 'auth@localBeats.com',
      to: foundUser.email,
      subject: 'localBeats Password-less Login Magic Link',
      text: 'Hello, ' + foundUser.firstName,
      html: '<p><b>Hello, ' + foundUser.firstName + '!<br>' +
        '<br>Click this link to get verified and continue your session: <br><br>' +
        sameTabUrl +
        '<br><br><br>But, if you accidently closed your localBeats window, ' +
        '<a href="' + callbackUrl +
        '">click here to start a new session</a>' +
        '<br><br>Thanks'
    };

    mailer.sendEmail(message.from, message.to, message.subject, message.html)
      .then(data => {
        res.status(200).send({ user: foundUser, message: 'Magic link sent!' });
      }, error => {
        res.status(520).send('Unable to send the email... Try again later');
      });
  });
}

exports.verifyLocalJwtAndReturnUser = function (req, res) {
  // Verify received JWT against the secret
  jwt.verify(req.body.jwt, config.secret, function (err, decodedToken) {
    if (err) {
      res.status(520).send({ auth: false, message: 'Token expired or is invalid. Request another magic link.' });
    }

    // Find the user from the decoded token's id claim and return it with a new JWT session token
    User.findById(decodedToken.id, function (err, foundUser) {
      if (err) {
        return res.status(500).send('There was a problem finding the user.');
      }
      if (!foundUser) {
        return res.status(404).send('User is not registered.');
      }

      // Generate a new JWT session token
      var token = jwt.sign({ id: foundUser._id }, config.secret, {
        expiresIn: 86400 // expires in 24 hours
      });

      // Update the isOnline status
      User.findByIdAndUpdate(foundUser._id, { isOnline: true }, { new: true }, function (err, authUser) {
        if (err) {
        }
      });

      // foundUser.hashPassword = undefined;
      res.status(200).send({ auth: true, token: token, user: foundUser });
    });
  });
}

exports.verifyTokenFromUrlAndSendSocketResultToClient = function (req, res) {

  // Verify received JWT against the secret
  jwt.verify(req.params.token, config.secret, function (err, decodedToken) {
    if (err) {
      const message = 'Invalid Token';
      socketServer.broadcastResultToAllClientsViaSocket(false, null, null, 520, message); 
      res.status(520).send('This token has expired or is invalid. Request another magic link.<br>The page has already been refreshed for you in the other tab <br><strong>Please close this tab now</strong>');
    }

    // Find the user from the decoded token's id claim and return it with a new JWT session token
    User.findById(decodedToken.id, function (err, foundUser) {
      if (err) {
        const message = 'There was a problem finding the user.';
        socketServer.broadcastResultToAllClientsViaSocket(false, null, null, 500, message);
        return res.status(500).send('There was a problem finding the user. More details in localBeats tab. <br><strong>Please close this tab now</strong>');
      }
      if (!foundUser) {
        const message = 'User is not registered';
        socketServer.broadcastResultToAllClientsViaSocket(false, null, null, 404, message);
        return res.status(404).send('User is not registered. More details in localBeats tab. <br><strong>Please close this tab now</strong>');
      }

      // Generate a new JWT session token
      var token = jwt.sign({ id: foundUser._id }, config.secret, {
        expiresIn: 86400 // expires in 24 hours
      });

      // Update the isOnline status
      User.findByIdAndUpdate(foundUser._id, { isOnline: true }, { new: true }, function (err, authUser) {
        if (err) {
        }
      });

      // foundUser.hashPassword = undefined;
      // res.status(200).send({ auth: true, token: token, user: foundUser });
      socketServer.broadcastResultToAllClientsViaSocket(true, token, foundUser, 200, 'success');
      res.status(200).send('You are good to go!<br><strong>Please close this tab now. We can\'t for security reasons</strong>')
    });
  });
}

exports.verifyReCaptchaWithGet = function (req, res) {

  var authOptions = {
    url : 'https://www.google.com/recaptcha/api/siteverify?secret=' + config.reCaptcha.secret
              + '&response=' + req.body.response
  }
  request.get(authOptions, function(err, response, body) {
    if (err) {
      return res.status(404).send({
        success: false,
        error: err,
        message: 'Something went wrong on google server. Try again later...'
      });
    }
    if (response.statusCode === 200 && JSON.parse(response.body).success === true) {
      res.status(200).send({
        success: true,
        response: response.body
      });
    } else {
      res.status(404).send({
        success: false,
        response: response.body,
        message: 'Captcha timed or duplicate. Please try again...'
      });
    }
  });
}

exports.signInWithGoogle = function (req, res) {
  var authOptions = {
    url : 'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + req.body.idToken
  }
  request.get(authOptions, function(err, response, body) {
    if (err) {
      return res.status(404).send({
        success: false,
        error: JSON.parse(err),
        message: 'Something went wrong on google server. Try again later...'
      });
    }
    const jsonResponse = JSON.parse(response.body);
    if (response.statusCode === 200 && jsonResponse.aud === config.google.clientID) {

      User.findOne({ "google.id": jsonResponse.sub }, function (err, user) {
        if (err) {
          console.error('GOOGLE', err);
          return res.status(500).send({
            error: err,
            message: 'Error on the sign-in server.'
          });
        }
        if (!user) {
          console.error('GOOGLE: cannot find user');
          return res.status(404).send({
            message: 'You are not registered with a google account...'}
          );
        }
        var token = jwt.sign({ id: user._id }, config.secret, {
          expiresIn: 86400 // expires in 24 hours
        });
    
        User.findByIdAndUpdate(user._id, { isOnline: true }, { new: true }, function (err, authUser) {
          if (err) {
          }
        });
    
        res.status(200).send({ auth: true, token: token, user: user });
      });
    } else {
      res.status(404).send({
        success: false,
        response: jsonResponse,
        message: 'Unable to verify google token. Please try again...'
      });
    }
  });
}

exports.verifyGoogleIdToken = function (req, res) {
  var authOptions = {
    url : 'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + req.body.idToken
  }
  request.get(authOptions, function(err, response, body) {
    if (err) {
      return res.status(404).send({
        success: false,
        error: JSON.parse(err),
        message: 'Something went wrong on google server. Try again later...'
      });
    }
    const jsonResponse = JSON.parse(response.body);
    if (response.statusCode === 200 && jsonResponse.aud === config.google.clientID) {
      // Send back response 200 and obtained payload
      res.status(200).send({
        success: true,
        response: jsonResponse
      });
    } else {
      res.status(404).send({
        success: false,
        response: jsonResponse,
        message: 'Unable to verify google token. Please try again...'
      });
    }
  });
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
  User.findByIdAndUpdate(req.body._id, { isOnline: false }, { new: true }, function (err, authUser) {
    if (err) {
    }
  });

  res.status(200).send({ auth: false, token: null });
};
