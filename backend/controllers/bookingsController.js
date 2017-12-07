'use strict';

var mongoose    = require('mongoose');
var jwt         = require('jsonwebtoken');
var bcrypt      = require('bcrypt');
var Bookings      = mongoose.model('Bookings');
var Events      = mongoose.model('Events');
var config    = require('../../config.js');

// ====== Bookings ROUTES ======

exports.listAllBookings = function (req, res) {
    Bookings.find({}).populate('hostUser').populate('performerUser').exec(function (err, bookings) {
      if (err)
        return res.send(err);

        var bkkins = [];
        bookings.forEach(function(booking) {
            bkkins.push({"booking": booking});
        });
            
        return res.status(200).send({"bookings": bkkins});
    });
};

// params eid
exports.getBookingByEID = function (req, res) {
    Bookings.find({eventEID: req.query.eid}).populate('hostUser').populate('performerUser').exec(function (err, bookings) {
      if (err)
        return res.send(err);

        var bkkins = [];
        bookings.forEach(function(booking) {
            bkkins.push({"booking": booking});
        });
            
        return res.status(200).send({"bookings": bkkins});
    });
};

exports.getBookingByID = function (req, res) {
  Bookings.findById(req.params.bid).populate('hostUser').populate('performerUser').exec(function (err, booking) {
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
            Bookings.findById(booking._id).populate('hostUser').populate('performerUser').exec(function (err, booking) {
                if (err) {
                    return res.status(500).send("Failed to create booking");
                } else {
                    return res.status(200).send({ "booking": booking });
                }
            });
        }
    });
};

exports.updateBookingByID = function (req, res) {
    Bookings.findByIdAndUpdate(req.params.bid, req.body.booking, { new: true }).populate('hostUser').populate('performerUser').exec(function (err, booking) {
        if (err) {
            return res.status(500).send("There was a problem updating the booking.");
        }
        Bookings.findById(booking._id).populate('hostUser').populate('performerUser').exec(function (err, booking) {
            if (err) {
                return res.status(500).send("Failed to update booking");
            } else {
                return res.status(200).send({ "booking": booking });
            }
        });
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
// user_type (string) in {"arist", "host"} which is the user type of uid. Does the uid correspond to an artist or event host?--required
// status (string) in {"approved", "pending", "completed"} --optional - defaults to all
// booking_type (string) in {"arist-apply", "host-request"} --optional defaults to all
// eid (string) event ID in question --optional
// skip (int) how many records to skip --optional - defaults to 0
// limit (int) how many records to return --optional - defaults to 10

// Get a list of events an artist has applied for
// Get a list of hosts requested artists (for a given event)
// Get a list of all bookings for a user
// Get a list of all approved events for an artist
exports.getUserBookingsByUID = function (req, res) {
  
  if (req.query.uid == null) {
      return res.status(403).send({"error": "Must provided uid"});
  }

  var limit = 10;
  var skip = 0;
  var query = {};

  if (req.query.limit != null) {
      limit = parseInt(req.query.limit);
  }

  if (req.query.skip != null) {
      skip = parseInt(req.query.skip);
  }

  if (req.query.user_type == null) {
    return res.status(403).send({"error": "Must send user_type"});
  } else {
      if (req.query.user_type == "artist") {
        query.performerUser = req.query.uid;
        // TODO Send notification to host about application to event in POST
      } else if (req.query.user_type == "host") {
        // TODO Send notification to artist about request in POST
        query.hostUser = req.query.uid;
      }
  }

  if (req.query.status != null) {
    if (req.query.status == "approved") {
        query.approved = true;
    } else if (req.query.status == "pending") {
        query.approved = false;
    } else if (req.query.status == "completed") {
        query.completed = true;
    }
  }

  if (req.query.booking_type != null) {
      query.bookingType = req.query.booking_type;
  }

  if (req.query.eid != null) {
      query.eventEID = req.query.eid;
  }

  Bookings.find(query).limit(limit).skip(skip).sort({ fromDate: -1 }).populate('hostUser').populate('performerUser').exec(function (err, doc) {
      if (err) {
          return res.status(500).send("Failed to get user bookings");
      } else {
            var bkkins = [];
            doc.forEach(function(booking) {
                bkkins.push({"booking": booking});
            });
                
            return res.status(200).send({"bookings": bkkins});
      }
  });
};

// Deletes all a hosts bookings via hostUID
exports.deleteUserBookingsByUID = function (req, res) {
  Bookings.remove({hostUser: req.query.hostUID}).exec(function (err, doc) {
      if (err) {
          return res.status(500).send("Failed to delete user bookings");
      } else {
          return res.status(200).send(doc);
      }
  });
};

// Take a bid
exports.acceptBooking = function(req, res) {
    // Notify both parties
    Bookings.findById(req.params.bid, function (err, booking) {
        var eventEID = booking.eventEID;
        Bookings.update({_id: req.params.bid}, {
            approved: true
        }, function(err, numberAffected, rawResponse) {
            if (err) {
                return res.status(500).send("Failed to accept booking.");
            }
            Events.update({_id: eventEID}, {
                isBooked: true
            }, function(err, numberAffected, rawResponse) {
                if (err) {
                    return res.status(500).send("Failed to accept booking.");
                }
                return res.status(200).send({"message": "Accepted booking."});
            })
        })
    });

};

// Takes a bid
exports.declineBooking = function(req, res) {
    // Notifiy both parties
    Bookings.findByIdAndRemove(req.params.bid, function (err, user) {
        if (err) {
          return res.status(500).send("There was a problem declining the booking");
        } else {
          if (user == null) {
            return res.status(200).send("Booking does not exist");
          } else {
            return res.status(200).send("Booking declined");
          }
        }
      });
};

// Takes eid and uid
// Returns true if uid is associated with eid through a booking
exports.userHasBooked = function(req, res) {
    Bookings.find({$or: [ {hostUser: req.query.uid}, {performerUser: req.query.uid} ], eventEID: req.query.eid }, function (err, bookings) {
        if (err) {
            return res.status(500).send("There was a problem declining the booking");
        } else {
            return res.status(200).send({"result": bookings.length == 0});
        } 
    });
};

