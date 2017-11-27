'use strict';

var mongoose    = require('mongoose');
var jwt         = require('jsonwebtoken');
var bcrypt      = require('bcrypt');
var Bookings      = mongoose.model('Bookings');
var config      = require('../../../config.js');

// ====== Bookings ROUTES ======

exports.listAllBookings = function (req, res) {
    Bookings.find({}, function (err, booking) {
      if (err)
        return res.send(err);

      return res.status(200).send(booking);
    });
};

exports.getBookingByID = function (req, res) {
  Bookings.findById(req.params.bid, function (err, booking) {
      if (err) {
          return res.status(500).send("Failed to get booking");
      } else {
          return res.status(200).send(booking);
      }
  });
};

exports.createBooking = function (req, res) {
    var newBooking = new Bookings(req.body.booking);
    newBooking.save(function (err, booking) {
        if (err) {
            return res.status(400).send({
                message: err,
                description: "Failed to create a booking"
            });
        } else {
            return res.status(200).send(booking);
        }
    });
};

exports.updateBookingByID = function (req, res) {
    Bookings.findByIdAndUpdate(req.params.bid, req.body, { new: true }, function (err, booking) {
        if (err) {
            return res.status(500).send("There was a problem updating the booking.");
        }
        return res.status(200).send(booking);
    });
};

exports.deleteBookingByID = function (req, res) {
    Bookings.findByIdAndRemove(req.params.bid, function (err, booking) {
        if (err) {
            return res.status(500).send("There was a problem deleting the booking.");
        } else {
            if (booking == null) {
                return res.status(200).send("Booking was already deleted.");
            } else {
                return res.status(200).send("Booking removed");
            }
        }
    });
};
