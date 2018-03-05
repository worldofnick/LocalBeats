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

// params eid
exports.getNotificationsForUser = function (req, res) {
    Notifications.find({receiverID: req.params.uid}).populate('senderID').populate('receiverID').exec(function (err, notifications) {
      if (err)
        return res.send(err);

        return res.status(200).send({"notifications": notifications});
    });
};

exports.deleteNotificationsByID = function (req, res) {
    Notifications.findByIdAndRemove(req.params.nid, function (err, message) {
        if (err) {
            return res.status(500).send("There was a problem deleting the notification.");
        } else {
            if (message == null) {
                return res.status(200).send("notification was already deleted.");
            } else {
                    return res.status(200).send({ notification: message, msg: 'Notification removed successfully'});
            }
        }
    });
}

exports.saveNotification = function (req, res) {

    var newNotification = new Notification(req.body);

    Notifications.save(function (err, newNotification) {
      if (err) {
        return res.status(400).send("Failed to create notification");
      }else{
      }
    });
};
