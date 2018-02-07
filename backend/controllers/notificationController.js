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

// getNotificationsForUser
// exports.getNotificationsForUser = function (req, res) {
//     Notifications.findById(req.params.uid).populate('senderID').populate('receiverID').exec(function (err, notifications) {
//         if (err) {
//             return res.status(500).send("Failed to get notifications");
//         } else {
//             return res.status(200).send({ "notifications": notifications });
//         }
//     });

// };

// exports.sendNotificationToUser = function (req, res) {

// var notification = new Notifications(); // build notification "someone has requested you to play blah"
//                     notification.receiverID = newBooking.performerUser;
//                     notification.senderID = newBooking.hostUser;
//                     notification.message = notification.senderID['firstName'] + " has requested you for an event";

//                     notification.icon = 'queue_music';
//                     notification.eventID = newBooking._id;
//                     // add timestamp to notification.sentTime of type date.
//                     console.log("printing notification");
//                     console.log(notification);
//                     notification.save(function (err, notification) {
//                       if (err) {
//                         return res.status(500).send("Failed to create booking notification");
//                       }
//                     //   io.emit("notification", { notification: notification });
//                     });

//                 }
// params eid
exports.getNotificationsForUser = function (req, res) {
    Notifications.find({receiverID: req.params.uid}).populate('senderID').populate('receiverID').exec(function (err, notifications) {
      if (err)
        return res.send(err);

        return res.status(200).send({"notifications": notifications});
    });
};

exports.deleteNotificationsByID = function (req, res) {
    console.log(req);
    //todo fix this so itll loop correctly.
    Notification.findByIdAndRemove(req.params.uid, function (err, event) {
        if (err) {
            return res.status(500).send("There was a problem deleting the notification.");
        } else {
            if (event == null) {
                return res.status(200).send("notification was already deleted.");
            } else {
                notification.remove({eventEID: event._id}, function (err, bookings) {
                    return res.status(200).send("notification " + notification.message + " is removed");
                });
            }
        }
    });
}

exports.saveNotification = function (req, res) {
    console.log('SAVAING MESSAGE');

    let newNotification = new Notification();
    newNotification = req.body;

    console.log("save this notification");
    console.log(newNotification);
    notification.save(function (err, newNotification) {
      if (err) {
        return res.status(500).send("Failed to create booking notification");
      }
    //   io.emit("notification", { notification: notification });
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
