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
    Users.findById(req.params.id).populate('hostUser').populate('performerUser').exec(function (err, notifications) {
        if (err) {
            return res.status(500).send("Failed to get notifications");
        } else {
            return res.status(200).send({ "notifications": notifications });
        }
    });

};

// app.get("/api/events/:eid",
exports.sendNotificationToUser = function (req, res) {
    Users.findById(req.params.eid).populate('hostUser').populate('performerUser').exec(function (err, event) {
        if (err) {
            return res.status(500).send("Failed to get event");
        } else {
            return res.status(200).send({ "event": event });
        }
    });
};

exports.createEvent = function (req, res) {
    var newEvent = new Events(req.body.event);

    if (newEvent.eventPicUrl == null) {
      newEvent.eventPicUrl = getDefaultImage(newEvent.eventType)
    }

    newEvent.save(function (err, event) {  // callback function with err and success value
        if (err) {
            return res.status(400).send({
                message: err,
                description: "Failed to create an event"
            });
        } else {
            Events.findById(event._id).populate('hostUser').populate('performerUser').exec(function (err, fetchedEvent) {
                if (err) {
                    return res.status(500).send("Failed to create event");
                } else {
                    console.log("PRINTING NEW EVENT");
                    console.log(fetchedEvent)
                    return res.status(200).send({ "event": fetchedEvent });
                }
            });
        }
    });
};

// app.get("/api/events/:eid",
exports.getNotificationsCount = function (req, res) {
    // Notifications.findById(req.params.eid).populate('hostUser').populate('performerUser').exec(function (err, event) {
    //     if (err) {
    //         return res.status(500).send("Failed to get event");
    //     } else {
    //         return res.status(200).send({ "event": event });
    //     }
    // });
    return 7;
};

