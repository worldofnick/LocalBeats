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

// Params 
// uid (string) user id in question --requied
// user_type (string) in {"arist", "host"} --required
// status (string) in {"approved", "pending"} --optional - defaults to all
// booking_type (string) in {"arist-apply", "host-request"} --optional defaults to all
// eid (string) event ID in question --optional

// skip (int) how many records to skip --optional - defaults to 0
// limit (int) how many records to return --optional - defaults to 10

// Get a list of events an artist has applied for
// Get a list of hosts requested artists (for a given event)
// Get a list of all bookings for a user
// Get a list of all approved events for an artist

exports.getUserBookingsByUID = function (req, res) {
  var limit = 10;
  var skip = 0;
  var query = {};

  if (req.params.limit != null) {
      limit = parseInt(req.query.limit);
  }

  if (req.params.skip != null) {
      skip = parseInt(req.query.skip);
  }

  if (req.params.user_type == null) {
    return res.status(200).send({"error": "Must send user_type"});
  } else {
      if (req.params.user_type == "artist") {
        query.performerUID = req.params.uid;
      } else if (req.params.user_type == "host") {
        query.hostUID = req.params.uid;
      }
  }

  if (req.params.status != null) {
    if (req.params.status == "approved") {
        query.approved = true;
    } else if (req.params.status == "pending") {
        query.approved = false;
    }
  }

  if (req.params.booking_type != null) {
      query.bookingType = req.params.booking_type;
  }

  if (req.params.eid != null) {
      query.eventEID = req.params.eid;
  }

  Bookings.find(query).limit(limit).skip(skip).sort({ fromDate: -1 }).exec(function (err, doc) {
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
