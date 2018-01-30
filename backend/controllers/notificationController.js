'use strict';

var mongoose    = require('mongoose');
var jwt         = require('jsonwebtoken');
var bcrypt      = require('bcrypt');
var Users        = mongoose.model('User');
var Events      = mongoose.model('Events');
var Bookings    = mongoose.model('Bookings');
var Notifications  = mongoose.model('Notification');
var config    = require('../../config.js');

// ====== NOTIFICATION ROUTES ======

//getNotificationsForUser
exports.getNotificationsForUser = function (req, res) {
    Notifications.findById(req.params.uid).populate('senderID').populate('receiverID').exec(function (err, notifications) {
        if (err) {
            return res.status(500).send("Failed to get notifications");
        } else {
            return res.status(200).send({ "notifications": notifications });
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
