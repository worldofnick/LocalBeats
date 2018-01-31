'use strict';

var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var User = mongoose.model('User');
var config = require('../../config.js');
var Notifications = mongoose.model('Notification');

// ====== USER ROUTES ======

exports.listAllUsers = function (req, res) {
  User.find({}, { hashPassword: 0 }, function (err, users) {
    if (err)
      return res.send(err);
    users.hashPassword = undefined;
    // var usrs = [];
    // users.forEach(function(user) {
    //   usrs.push({"user": user});
    // });
    return res.status(200).send({ "users": users });
  });
};

exports.getUserByID = function (req, res) {
  User.findById(req.params.uid, { hashPassword: 0 }).populate('notifications').exec(function (err, user) {
      if (err) {
          return res.status(500).send("Failed to get user");
      } else {
          return res.status(200).send({ user: user });
      }
  });

};

// exports.updateUserByID = function (req, res, next) {
//   User.findByIdAndUpdate(req.params.uid, req.body.user, { new: true }, function (err, user) {
//     if (err) {
//       return res.status(520).send({ message: "Error finding the user from this UID...", error: err });
//     }
//     user.hashPassword = undefined;
//     if(req.body.user.spotifyID != undefined) {
//       console.log("Spotify ID: " + req.body.user.spotifyID);
//       next();
//     }else {
//       return res.status(200).send({ user: user });
//     }
//   });
// };


exports.updateUserByID = function (req, res, next) {
  User.findByIdAndUpdate(req.params.uid, req.body.user, { new: true }, function (err, user) {
    if (err) {
      return res.status(520).send({ message: "Error finding the user from this UID...", error: err });
    }

    user.hashPassword = undefined;
    if(req.body.user.spotifyID != undefined) {
      console.log("Spotify ID: " + req.body.user.spotifyID);
      next();
    }else {
      return res.status(200).send({ user: user });
    }
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
        // Remove all events
        // Remove all bookings
        // Remove all toReviews
        return res.status(200).send("User " + user.email + " is removed");
      }
    }
  });
};

// Params
// name (string) name of the user
// artist (boolean) true to return only artists, false to return all. Defaults to true
// lat/lon..
// genres (array) genre of the user ** cannot be used in junction with artist=false
// event_types (array)
// skip (int)
// limit (int)
exports.searchUsers = function (req, res) {
  var query = {}
  var limit = 15;
  var skip = 0;

  if (req.query.limit != null) {
    limit = req.query.limit;
  }

  if (req.query.skip != null) {
    skip = req.query.skip;
  }

  if (req.query.name != null) {
    query.firstName = new RegExp(req.query.name);
  }

  query.isArtist = false
  if (req.query.artist != null) {
    query.isArtist = req.query.artist;
  }

  if (req.query.genres != null && req.query.genres != "all genres") {
    query.genres = {
      "$in": req.query.genres
    }
  }

  if (req.query.event_types != null) {
    query.event_types = {
      "$in": req.query.event_type
    }
  }

  if (req.query.lat != null && req.query.lon != null) {
    query.location = {
      "$near": [
        parseFloat(req.query.lat),
        parseFloat(req.query.lon)
      ]
    }
  }

  User.find(query).limit(limit).skip(skip).exec(function (err, doc) {
    if (err) {
      return res.status(500).send(err);
    } else {
      var users = [];
      doc.forEach(function (user) {
        users.push({ "user": user });
      });

      return res.status(200).send({ "users": doc });
    }
  });
};

exports.getGenres = function (req, res) {
  var genres = ["All Genres", "Rock", "Classical", "Electronic", "Jazz", "Blues", "Hip-Hop", "Rap", "Alternative", "Country"];
  return res.status(200).send({ "genres": genres });
};
