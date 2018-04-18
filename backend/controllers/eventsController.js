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

      return res.status(200).send({"events": event});
    });
  };

exports.getEventByID = function (req, res) {
    Events.findById(req.params.eid).populate('hostUser').populate('performerUser').exec(function (err, event) {
        if (err) {
            return res.status(500).send("Failed to get event");
        } else {
            return res.status(200).send({ "event": event });
        }
    });
};

function getDefaultImage(eventType) {
  eventType = eventType.toLowerCase(); // just in case
  if (eventType == "birthday") {
    return "https://i.imgur.com/dLzog8K.jpg";
  } else if (eventType == "wedding") {
    return "https://i.imgur.com/OaIO9Qt.jpg";
  } else if (eventType == "party") {
    return "https://i.imgur.com/TY1Qr5C.jpg";
  } else if (eventType == "live music") {
    return "https://i.imgur.com/VqFLOp7.jpg";
  } else if (eventType == "business") {
    return "https://i.imgur.com/kvf5OTx.jpg";
  } else if (eventType == "festival") {
    return "https://i.imgur.com/BonL1L9.jpg";
  }

  return "https://i.imgur.com/dLzog8K.jpg";
}

exports.defaultPic = function (req, res) {
  res.send({"url": getDefaultImage(req.query.eventType)});
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
    // Sort by soonest event
    var sort = { fromDate: 1 };

    if (req.params.limit != null) {
        limit = parseInt(req.query.limit);

    }

    limit = 100;

    if (req.params.skip != null) {
        skip = parseInt(req.query.skip);
    }

    
    Events.find({hostUser: req.query.hostUID}).limit(limit).skip(skip).sort(sort).populate('hostUser').populate('performerUser').exec(function (err, doc) {
        if (err) {
            return res.status(500).send("Failed to get user events");
        } else {

            return res.status(200).send({"events": doc});
        }
    });
};

exports.deleteUserEventsByUID = function (req, res) {
  Events.remove({hostUser: req.query.hostUID}).exec(function (err, doc) {
      if (err) {
          return res.status(500).send("Failed to delete user events");
      } else {
          // Remove event bookings and reviews
          return res.status(200).send(doc);
      }
  });
};

function buildSort(req) {
    var sort = {};
    if (req.query.sort == 'Soonest') {
        sort = { fromDate: 1 };
    } else if (req.query.sort == 'Price High to Low') {
        sort = { fixedPrice: -1 }
    } else if (req.query.sort == 'Price Low to High') {
        sort = { fixedPrice: 1 }
    } else if (req.query.sort == 'Distance' || req.query.sort == 'Best Match') {
        sort = {}
    } else if (req.query.sort == 'Rating') {
        sort = { "hostUser.averageRating": -1 };
    }

    return sort;
}


function isString(x) {
    return Object.prototype.toString.call(x) === "[object String]"
}

// Search through events
// params
// skip (int) how many records to skip
// limit (int) how many records to return
// event_types (array) ["wedding", "birthday"]
// event_genres (array) ["rock"]
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

  limit = 100;

  if(req.query.limit != null) {
    limit = parseInt(req.query.limit);
  }

  var query = {};
  if (req.query.event_types != null && req.query.event_types != "all events") {
    if (isString(req.query.event_types)) {
      req.query.event_types = [req.query.event_types]
    }
    query.eventType = {
      "$in": req.query.event_types
    }
  }

  if (req.query.genres != null && req.query.genres != "all genres") {
    if (isString(req.query.genres)) {
      req.query.genres = [req.query.genres]
    }
    query.eventGenres = {
      "$in": req.query.genres
    }
  }

  if (req.query.from_date != null && req.query.to_date != null) {
    if (Date(req.query.from_date) > Date(req.query.to_date)) {
        res.status(400).send({"error": "from date comes after to date"});
    }
  } 

  if (req.query.from_date != null) {
    query.fromDate = {
      "$gte": Date(req.query.from_date)
    }
  }
  
  if (req.query.to_date != null) {
    query.toDate = {
      "$gte": Date(req.query.to_date)
    }
  }
  
  if (req.query.to_date == null && req.query.from_date == null) {
      // No date provided, only show events playing from now onwards
      query.fromDate = {
        "$gte": Date()
      }
  }

  if (req.query.min_budget != null && req.query.max_budget != null) {
    query.fixedPrice = {
        "$and": [
            {"$gte": parseInt(req.query.min_budget)},
            {"$lte": parseInt(req.query.max_budget)}
        ]
    }
  }

//   if (req.query.booked != null) {
//     query.isBooked = req.query.booked;
//   } else {
//     query.isBooked = false;
//   }

  if (req.query.lat != null && req.query.lon != null) {
    query.location = { $nearSphere: { $geometry: { type: "Point", coordinates: [ parseFloat(req.query.lon) , parseFloat(req.query.lat) ] }, $maxDistance: 100000 } } // search 62 miles
   }

  if (req.query.name != null) {
    query.eventName = new RegExp(req.query.name, 'gi');
  }

  if (req.query.uid != null) {
    query.hostUser = {
        "$ne": new mongoose.mongo.ObjectId(req.query.uid)
    }
  }

  Events.find(query).limit(limit).skip(skip).sort(sort).populate('hostUser').populate('performerUser').exec(function (err, doc) {
      if (err) {
          return res.status(500).send(err);
      } else {
            return res.status(200).send({"events": doc});
      }
  });
};

exports.getEventTypes = function (req, res) {
    var eventTypes = ["wedding", "birthday", "business", "live music", "party", "festival"];
    return res.status(200).send( {"eventTypes": eventTypes} );
  };

  
exports.getEventSortTypes = function (req, res) {
    // "Price High to Low", "Price Low to High", "Soonest"];
    var sorts = ["Best Match", "Price High to Low", "Price Low to High", "Soonest", "Rating", "Distance"];
    return res.status(200).send({ "sorts": sorts });
};
