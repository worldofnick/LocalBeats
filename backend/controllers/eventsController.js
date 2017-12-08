'use strict';

var mongoose    = require('mongoose');
var jwt         = require('jsonwebtoken');
var bcrypt      = require('bcrypt');
var Events      = mongoose.model('Events');
var Bookings    = mongoose.model('Bookings');
var config    = require('../../config.js');

// ====== EVENT ROUTES ======

exports.listAllEvents = function (req, res) {
    Events.find({}).populate('hostUser').populate('performerUser').exec(function (err, event) {
      if (err)
        return res.send(err);
    
        var events = [];
        event.forEach(function(event) {
            events.push({"event": event});
        });
        
      return res.status(200).send({"events": events});
    });
  };

// app.get("/api/events/:eid", 
exports.getEventByID = function (req, res) {
    Events.findById(req.params.eid).populate('hostUser').populate('performerUser').exec(function (err, event) {
        if (err) {
            return res.status(500).send("Failed to get event");
        } else {
            return res.status(200).send({ "event": event });
        }
    });
};

exports.createEvent = function (req, res) {
    var newEvent = new Events(req.body.event);
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
                    return res.status(200).send({ "event": fetchedEvent });
                }
            });
        }
    });
};    

exports.updateEventByID = function (req, res) {
    Events.findByIdAndUpdate(req.params.eid, req.body.event, { new: true }, function (err, event) {
        if (err) {
            return res.status(500).send("There was a problem updating the event.");
        }
        Events.findById(event._id).populate('hostUser').populate('performerUser').exec(function (err, event) {
            if (err) {
                return res.status(500).send("Failed to update event");
            } else {
                return res.status(200).send({ "event": event });
            }
        });
    });
};

exports.deleteEventByID = function (req, res) {
    Events.findByIdAndRemove(req.params.eid, function (err, event) {
        if (err) {
            return res.status(500).send("There was a problem deleting the event.");
        } else {
            if (event == null) {
                return res.status(200).send("Event was already deleted.");
            } else {
                Bookings.remove({eventEID: event._id}, function (err, bookings) {
                    return res.status(200).send("Event " + event.eventName + " is removed");
                });
            }
        }
    });
};

/**
 * Parameters: hostUID, limit, skip
 */
exports.getUserEventsByUID = function (req, res) {
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
            var events = [];
            doc.forEach(function(event) {
                events.push({"event": event});
            });
            
            return res.status(200).send({"events": events});
        }
    });
};

exports.deleteUserEventsByUID = function (req, res) {
  Events.remove({hostUser: req.query.hostUID}).exec(function (err, doc) {
      if (err) {
          return res.status(500).send("Failed to delete user events");
      } else {
          return res.status(200).send(doc);
      }
  });
};

  function buildSort(req) {
    var sort = { fromDate: -1 };
    if (req.query.sort == 'date-asc') {
      sort = { fromDate: 1 };
    } else if (req.query.sort == 'price-desc') {
      sort = { fixedPrice: -1 }
    } else if (req.query.sort == 'price-asc') {
      sort = { fixedPrice: 1 }
    } else if (req.query.sort == 'distance-desc' || req.query.sort == 'distance-asc') {
      sort = {}
    }

    return sort;
  }

// Search through events
// params
// skip (int) how many records to skip
// limit (int) how many records to return
// event_type (string) ("wedding", "birthday")
// event_genre (string) ("rock", etc)
// from_date & to_date (string) ISODate
// min_budget & max_budget (int)
// booked (boolean) defaults ot false. If true returns events that are currently booked
// lat (string) & lon (string)
// name (string) fuzzy match search by event names
// sort (string) in {"date-desc", "date-asc", "price-desc", "price-asc", "distance-desc", "distance-asc"} defaults to "date-desc" unless lat & lon are passed
exports.searchEvents = function(req, res) {
  var skip = 0;
  var limit = 15;
  var sort = buildSort(req);

  if(req.query.skip != null) {
    skip = parseInt(req.query.skip);
  }

  if(req.query.limit != null) {
    limit = parseInt(req.query.limit);
  }

  var query = {};
  if (req.query.event_type != null && req.query.event_type != "All Events") {
    query.eventType = req.query.event_type;
  }

  if (req.query.event_genre != null) {
    query.eventGenre = req.query.event_genre;
  }

  if (req.query.from_date != null && req.query.to_date != null) {
    query.fromDate = {
      $gte: ISODate(req.query.from_date)
    }

    query.toDate = {
      $lte: ISODate(req.query.to_date)
    }
  }

  if (req.query.min_budget != null && req.query.max_budget != null) {
    query.fixedPrice = {
      $gte: parseInt(req.query.min_budget),
      $lte: parseInt(req.query.max_budget)
    }
  }

//   if (req.query.booked != null) {
//     query.isBooked = req.query.booked;
//   } else {
//     query.isBooked = false;
//   }

  if (req.query.lat != null && req.query.lon != null) {
    query.location = {
        "$near": [
            parseFloat(req.query.lat),
            parseFloat(req.query.lon)
        ]
    }
   }

  if (req.query.name != null) {
    query.eventName = new RegExp(req.query.name);
  }

  Events.find(query).limit(limit).skip(skip).sort(sort).populate('hostUser').populate('performerUser').exec(function (err, doc) {
      if (err) {
          return res.status(500).send(err);
      } else {
            var events = [];
            doc.forEach(function(event) {
                events.push({"event": event});
            });
            
            return res.status(200).send({"events": events});
      }
  });
};

exports.getEventTypes = function (req, res) {
    var eventTypes = ["All Events", "Wedding", "Birthday", "Business", "Live Music", "Party", "Festival"];
    return res.status(200).send( {"eventTypes": eventTypes} );
  };
