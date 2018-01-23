'use strict';

var mongoose    = require('mongoose');
var jwt         = require('jsonwebtoken');
var bcrypt      = require('bcrypt');
var Users        = mongoose.model('User');
var Events      = mongoose.model('Events');
var Bookings    = mongoose.model('Bookings');
var config    = require('../../config.js');

// ====== EVENT ROUTES ======

exports.getNotificationsForUser = function (req, res) {
    Events.find({}).populate('hostUser').populate('performerUser').exec(function (err, event) {
      if (err)
        return res.send(err);

      return res.status(200).send({"events": event});
    });
  };

// app.get("/api/events/:eid",
exports.sendNotificationToUser = function (req, res) {
    Events.findById(req.params.eid).populate('hostUser').populate('performerUser').exec(function (err, event) {
        if (err) {
            return res.status(500).send("Failed to get event");
        } else {
            return res.status(200).send({ "event": event });
        }
    });
};