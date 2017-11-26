'use strict';

var mongoose    = require('mongoose');
var jwt         = require('jsonwebtoken');
var bcrypt      = require('bcrypt');
var Events      = mongoose.model('Events');
var config      = require('../../../config.js');

// ====== EVENT ROUTES ======

// app.get("/api/events/:eid", 
exports.getEventByID = function (req, res) {
    Events.findById(req.params.eid, function (err, event) {
        if (err) {
            return res.status(500).send("Failed to get event");
        } else {
            return res.status(200).send(event);
        }
    });
};

exports.createEvent = function (req, res) {
    var newEvent = new Events(req.body);
    newEvent.save(function (err, event) {  // callback function with err and success value
        if (err) {
            return res.status(400).send({
                message: err,
                description: "Failed to create an event"
            });
        } else {
            return res.status(200).send(event);
        }
    });
};    

exports.updateEventByID = function (req, res) {
    Events.findByIdAndUpdate(req.params.eid, req.body, { new: true }, function (err, event) {
        if (err) { 
            return res.status(500).send("There was a problem updating the event.");
        }
        return res.status(200).send(event);
    });
};

// app.delete("/api/events", 
exports.deleteEventByID = function (req, res) {

    Events.findByIdAndRemove(req.params.eid, function (err, event) {
        if (err) {
            return res.status(500).send("There was a problem deleting the event.");
        } else {
            if (event == null) {
                return res.status(200).send("Event was already deleted.");
            } else {
                return res.status(200).send("Event " + event.eventName + " is removed");
            }
        }
    });
};


exports.listAllUsers = function (req, res) {
  User.find({}, { hash_password: 0 }, function (err, user) {
    if (err)
      return res.send(err);
    user.hash_password = undefined;
    return res.status(200).send(user);
  });
};

exports.getUserByID = function (req, res) {
  User.findById(req.params.uid, { hash_password: 0 }, function (err, user) {
    if (err)
      return res.send(err);
    return res.json(user);
  });
};

exports.updateUserByID = function (req, res) {
  User.findByIdAndUpdate(req.params.uid, req.body, { new: true }, function (err, user) {
    if (err) return res.status(500).send("There was a problem updating the user.");

    user.hash_password = undefined;
    return res.status(200).send(user);
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
        return res.status(200).send("User " + user.name + " is removed");
      }
    }
  });
};
