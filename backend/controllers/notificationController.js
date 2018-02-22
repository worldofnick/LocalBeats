'use strict';

var mongoose    = require('mongoose');
var bcrypt      = require('bcrypt');
var Users        = mongoose.model('User');
var Events      = mongoose.model('Events');
var Bookings    = mongoose.model('Bookings');
var Notifications  = mongoose.model('Notification');
var config    = require('../../config.js');

// ====== NOTIFICATION ROUTES ======

// params eid
exports.getNotificationsForUser = function (req, res) {
    Notifications.find({receiverID: req.params.uid}).populate('senderID').populate('receiverID').exec(function (err, notifications) {
      if (err)
        return res.send(err);

        return res.status(200).send({"notifications": notifications});
    });
};

exports.deleteNotificationsByID = function (req, res) {
    //todo fix this so itll loop correctly.
    Notifications.findByIdAndRemove(req.params.uid, function (err, event) {
        if (err) {
            return res.status(500).send("There was a problem deleting the notification.");
        } else {
            if (event == null) {
                return res.status(200).send("notification was already deleted.");
            } else {
                Notifications.remove({eventEID: event._id}, function (err, bookings) {
                    return res.status(200).send("notification " + Notifications.message + " is removed");
                });
            }
        }
    });
}

exports.saveNotification = function (req, res) {

    let newNotification = new Notification();
    newNotification = req.body;

    Notifications.save(function (err, newNotification) {
      if (err) {
        return res.status(500).send("Failed to create booking notification");
      }
    });
};

exports.getNotificationsCount = function (req, res) {
    // No clue whats going on here - Nick
    return 7;
};
