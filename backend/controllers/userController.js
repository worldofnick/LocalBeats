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

exports.updateUserByID = function (req, res, next) {
  req.body.user.fullName = req.body.user.firstName + " " + req.body.user.lastName;
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

function isString(x) {
    return Object.prototype.toString.call(x) === "[object String]"
}

function buildSort(req) {
  //var sorts = ["Best Match", "Name", "Rating", "Distance"];
  var sort = {};
  if (req.query.sort == 'Name') {
      sort = { firstName: 1 };
  } else if (req.query.sort == 'Distance' || req.query.sort == 'Best Match') {
      sort = {}
  } else if (req.query.sort == 'Rating') {
    sort = { averageRating: -1 };
  }

  return sort;
}

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
  var sort = buildSort(req);

  if (req.query.limit != null) {
    limit = parseInt(req.query.limit);
  }

  limit = 100;

  if (req.query.skip != null) {
    skip = parseInt(req.query.skip);
  }

  if (req.query.name != null) {
    query.fullName = new RegExp(req.query.name, 'gi'); 
  }

  if (req.query.artist != null) {
    query.isArtist = req.query.artist;
  }

  if (req.query.event_types != null && req.query.event_types != "all events") {
    if (isString(req.query.event_types)) {
      req.query.event_types = [req.query.event_types]
    }
    query.eventTypes = {
      "$in": req.query.event_types
    }
  }

  if (req.query.genres != null && req.query.genres != "all genres") {
    if (isString(req.query.genres)) {
      req.query.genres = [req.query.genres]
    }
    query.genres = {
      "$in": req.query.genres
    }
  }

  if (req.query.lat != null && req.query.lon != null) {
    query.location = { $nearSphere: { $geometry: { type: "Point", coordinates: [ parseFloat(req.query.lon) , parseFloat(req.query.lat) ] }, $maxDistance: 100000 } } // search 62 miles
  }

  if (req.query.uid != null) {
    query._id = {
      "$ne": new mongoose.mongo.ObjectId(req.query.uid),
      "$ne": new mongoose.mongo.ObjectId("5a78aab8ea6eb81f672b1b08")
    }
  }

  query.email = {
    "$ne": "beatbot@localbeats.com"
  }

  User.find(query).limit(limit).skip(skip).sort(sort).exec(function (err, doc) {
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
  var genres = ["rock", "classical", "electronic", "jazz", "blues", "hip-hop", "rap", "alternative", "country"];
  return res.status(200).send({ "genres": genres });
};

exports.getUserSortTypes = function (req, res) {
  var sorts = ["Best Match", "Rating", "Distance"];
  return res.status(200).send({ "sorts": sorts });
};