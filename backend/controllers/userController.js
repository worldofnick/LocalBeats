'use strict';

var mongoose  = require('mongoose');
var jwt       = require('jsonwebtoken');
var bcrypt    = require('bcrypt');
var User      = mongoose.model('User');
var config    = require('../../config.js');

// ====== USER ROUTES ======

exports.listAllUsers = function (req, res) {
  User.find({}, { hashPassword: 0 }, function (err, user) {
    if (err)
      return res.send(err);
    user.hashPassword = undefined;
    return res.status(200).send(user);
  });
};

exports.getUserByID = function (req, res) {
  User.findById(req.params.uid, { hashPassword: 0 }, function (err, user) {
    if (err)
      return res.send(err);
    return res.json({user:user});
  });
};

exports.updateUserByID = function (req, res) {
  User.findByIdAndUpdate(req.params.uid, req.body.user, { new: true }, function (err, user) {
    if (err) return res.status(500).send("There was a problem updating the user.");

    user.hashPassword = undefined;
    return res.status(200).send({user:user});
  });
};

exports.deleteUserByID = function (req, res) {

  User.findByIdAndRemove(req.params.uid, function (err, user) {
    if (err) {
      return res.status(500).send("There was a problem deleting the user.");
    } else {
      if (user == null) {
        return res.status(200).send("User was already deleted.");
      } else {
        return res.status(200).send("User " + user.email + " is removed");
      }
    }
  });
};

// exports.searchUsersByName = function (req, res) {
//
//   var query = {};
//   if (req.query.name != null) {
//
//   }
//
//   User.find(query, { hashPassword: 0 }, function (err, user) {
//     if (err)
//       return res.send(err);
//     user.hashPassword = undefined;
//     return res.status(200).send(user);
//   });
// };
