'use strict';

var mongoose    = require('mongoose');
var jwt         = require('jsonwebtoken');
var bcrypt      = require('bcrypt');
var Events      = mongoose.model('Events');
var config      = require('../../../config.js');

// ====== EVENT ROUTES ======

exports.listAllEvents = function (req, res) {
    Events.find({}, function (err, event) {
      if (err)
        return res.send(err);
      
      return res.status(200).send(event);
    });
  };

// app.get("/api/events/:eid", 
exports.getEventByID = function (req, res) {
    Events.findById(req.params.eid, function (err, event) {
        if (err) {
            return res.status(500).send("Failed to get event");
        } else {
            return res.status(200).send(event);
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
            return res.status(200).send(event);
        }
    });
};    

exports.updateEventByID = function (req, res) {
    Events.findByIdAndUpdate(req.params.eid, req.body.event, { new: true }, function (err, event) {
        if (err) {
            return res.status(500).send("There was a problem updating the event.");
        }
        return res.status(200).send(event);
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
                return res.status(200).send("Event " + event.eventName + " is removed");
            }
        }
    });
};

/**
 * Parameters: hostUID, limit, skip
 */
// app.get("/api/userEvents", 
//TODO: limit, find now working
exports.getUserEventsByUID = function (req, res) {
    console.log(req.body);
    console.log("HOST UID = " + req.query.hostUID);
    console.log("Limit = " + req.query.limit);
    var limit = 10;
    var skip = 0;

    if (req.params.limit != null) {
        limit = req.query.limit;
        
    }

    if (req.params.skip != null) {
        skip = req.query.skip;
    }

    Events.find({hostUID: req.query.hostUID}).limit(limit).skip(skip).exec(function (err, doc) {
        if (err) {
            return res.status(500).send("Failed to get user events");
        } else {
            return res.status(200).send(doc);
        }
    });
};

exports.deleteUserEventsByUID = function (req, res) {
  Events.remove({hostUID: req.query.hostUID}).exec(function (err, doc) {
      if (err) {
          return res.status(500).send("Failed to delete user events");
      } else {
          return res.status(200).send(doc);
      }
  });
};

  function buildSort(req) {
    var sort = { date: -1 };
    if (req.query.sort == 'date-asc') {
      sort = { date: 1 };
    } else if (req.query.sort == 'price-desc') {
      sort = { fixed_price: -1 }
    } else if (req.query.sort == 'price-asc') {
      sort = { fixed_price: 1 }
    } else if (req.query.sort == 'distance-desc' || req.query.sort == 'distance-asc') {
      sort = {}
    }

    return sort;
  }

// //   // params
// //   // event_type= (the event type)
// //   // lat= and lon= and distance= (to filter by location and distance meters)
// //   // start_date
// //   // end_date
// //   // min_budget
// //   // max_budget
// //   // sort (price-desc, price-asc, soonest, latest, closest, furtest) defaults to soonest
// //   // booked (boolean)
// //   // limit defaults to 15
// //   // skip defaults to 0
exports.searchEvents = function(req, res) {
  var skip = 0;
  var limit = 15;
  // var sort = buildSort(req);
  //
  if(req.query.skip != null) {
    skip = req.query.skip;
  }
  //
  if(req.query.limit != null) {
    limit = req.query.limit;
  }
  //
  var query = {};
  // // if (req.query.event_type != null) {
  // //   query[event_type] = req.query.event_type
  // // }
  //
  // if (req.query.from_date != null && req.query.to_date != null) {
  //   query[fromDate] = {
  //     $gte: ISODate(req.query.from_date)
  //   }
  //
  //   query[toDate] = {
  //     $lte: ISODate(req.query.to_date)
  //   }
  // }
  //
  // if (req.query.min_budget != null && req.query.max_budget != null) {
  //   query[fixed_price] = {
  //     $gte: req.query.min_budget,
  //     $lte: req.query.max_budget
  //   }
  // }
  //
  // if (req.query.booked != null) {
  //   query[isBooked] = req.query.booked;
  // }

  // if (req.query.lat != null && req.query.lon != null && req.query.distance) {
  //   query[location] =   { $near :
  //       {
  //         $geometry: { type: "Point",  coordinates: [ req.query.lat, req.query.long] },
  //         $minDistance: 0,
  //         $maxDistance: req.query.distance
  //       }
  //    }
  // }

  Events.find(query).limit(limit).skip(skip).exec(function (err, doc) {
      if (err) {
          return res.status(500).send("Failed to get user events");
      } else {
          return res.status(200).send(doc);
      }
  });
};
