'use strict';

var mongoose    = require('mongoose');
var jwt         = require('jsonwebtoken');
var User        = mongoose.model('User');
var config    = require('../../config.js');

/**
 * Custom middleware to check if the token exists and if it is valid.
 * After validating it, it adds the decoded.id value to the request (req) 
 * variable. The server now have access to it in the next function in line 
 * in the request-response cycle. Calling next() will make sure the flow will 
 * continue to the next function waiting in line.
 */
exports.verifyToken = function (req, res, next) {
    var token = req.headers['x-access-token'];
    if (!token)
      return res.status(403).send({ auth: false, message: 'No token provided.' });
    jwt.verify(token, config.secret, function(err, decoded) {
      if (err)
      return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
      // if everything good, save to request for use in other routes
      req.uid = decoded.id;
      next();
    });
}