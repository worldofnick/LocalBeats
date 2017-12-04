'use strict';

var mongoose    = require('mongoose');
var jwt         = require('jsonwebtoken');
var bcrypt      = require('bcrypt');
var Bookings      = mongoose.model('Bookings');
var config    = require('../../config.js');

// ====== Bookings ROUTES ======

exports.listAllBookings = function (req, res) {
    Bookings.find({}, function (err, bookings) {
      if (err)
        return res.send(err);

      return res.status(200).send(bookings);
    });
};

exports.getBookingByID = function (req, res) {
  Bookings.findById(req.params.bid, function (err, booking) {
      if (err) {
          return res.status(500).send("Failed to get booking");
      } else {
          return res.status(200).send({ "booking": booking });
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
            return res.status(200).send({ "booking": booking });
        }
    });
};

exports.updateBookingByID = function (req, res) {
    Bookings.findByIdAndUpdate(req.params.bid, req.body, { new: true }, function (err, booking) {
        if (err) {
            return res.status(500).send("There was a problem updating the booking.");
        }
        return res.status(200).send({ "booking": booking });
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

exports.getUserBookingsByUID = function (req, res) {
  var limit = 10;
  var skip = 0;

  if (req.params.limit != null) {
      limit = parseInt(req.query.limit);

  }

  if (req.params.skip != null) {
      skip = parseInt(req.query.skip);
  }

  Bookings.find({hostUID: req.query.hostUID}).limit(limit).skip(skip).exec(function (err, doc) {
      if (err) {
          return res.status(500).send("Failed to get user bookings");
      } else {
          return res.status(200).send(doc);
      }
  });
};

exports.deleteUserBookingsByUID = function (req, res) {
  Bookings.remove({hostUID: req.query.hostUID}).exec(function (err, doc) {
      if (err) {
          return res.status(500).send("Failed to delete user bookings");
      } else {
          return res.status(200).send(doc);
      }
  });
};
