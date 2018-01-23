import { Notification } from '../../src/app/models/notification';

'use strict';

var mongoose    = require('mongoose');
var jwt         = require('jsonwebtoken');
var bcrypt      = require('bcrypt');
var Users        = mongoose.model('User');
var Events      = mongoose.model('Events');
var Bookings    = mongoose.model('Bookings');
var Notifications  = mongoose.model('Notification');
var config    = require('../../config.js');

// ====== EVENT ROUTES ======

//getUserEventsByUID
exports.getNotificationsForUser = function (req, res) {
    var limit = 10;
    var skip = 0;

    if (req.params.limit != null) {
        limit = parseInt(req.query.limit);

    }

    if (req.params.skip != null) {
        skip = parseInt(req.query.skip);
    }

    Events.find({hostUser: req.query.hostUID}).limit(limit).skip(skip).populate('hostUser').populate('performerUser').exec(function (err, doc) {
        if (err) {
            return res.status(500).send("Failed to get user events");
        } else {

            return res.status(200).send({"events": doc});
        }
    });
};

// app.get("/api/events/:eid",
exports.sendNotificationToUser = function (req, res) {
    Notifications.findById(req.params.eid).populate('hostUser').populate('performerUser').exec(function (err, event) {
        if (err) {
            return res.status(500).send("Failed to get event");
        } else {
            return res.status(200).send({ "event": event });
        }
    });
};