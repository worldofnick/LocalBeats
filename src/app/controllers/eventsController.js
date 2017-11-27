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
    var newEvent = new Events(req.body);
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
    Events.findByIdAndUpdate(req.params.eid, req.body, { new: true }, function (err, event) {
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

// ----------------------------------------
// TODO: Start translating these methods
// ----------------------------------------

/**
 * How to translate?
 * 
 * 1. Move the route part "/api/userEvents" to eventsRoute.js
 * 2. Rename the remaining block of code as 
 *      exports.someFunctionName = function(req, res)  { ....}
 * 3. Add return statements to every res.status or whatever, since it 
 *    is a function that returns results now.
 * 4. Inside the function, db.collection(...).delete(...) changes to Events.delete(...)
 *    Events is the var at the top that refers to the mongoose schema eventsModel.
 * 5. That's it. Just start the server.js (as shown in Wiki pages) with nodemon and keep it
 *    running while coding. It will auto refresh whenever you make changes. Can also use my 
 *    postman link to add all the new event requests into the events folder.
 */



 

// app.delete("/api/userEvents", function(req, res) {
//     db.collection(EVENT_COLLECTION).delete({ _id: new ObjectID(req.query.id) }, function(err, result) {
//       if (err) {
//         handleError(res, err.message, "Failed to delete user events");
//       } else {
//         // Delete all bookings for this event?
//         res.status(200).json(req.params.id);
//       }
//     });
//   });


// // Generic error handler used by all endpoints.
// function handleError(res, reason, message, code) {
//     console.log("ERROR: " + reason);
//     res.status(code || 500).json({"error": message, "error_1": reason});
//   }

//   function buildSort(req) {
//     var sort = { date: -1 };
//     if (req.query.sort == 'date-asc') {
//       sort = { date: 1 };
//     } else if (req.query.sort == 'price-desc') {
//       sort = { fixed_price: -1 }
//     } else if (req.query.sort == 'price-asc') {
//       sort = { fixed_price: 1 }
//     } else if (req.query.sort == 'distance-desc' || req.query.sort == 'distance-asc') {
//       sort = {}
//     }

//     return sort;
//   }

//   // params
//   // event_type= (the event type)
//   // lat= and lon= and distance= (to filter by location and distance meters)
//   // start_date
//   // end_date
//   // min_budget
//   // max_budget
//   // sort (price-desc, price-asc, soonest, latest, closest, furtest) defaults to soonest
//   // booked (boolean)
//   // limit defaults to 15
//   // skip defaults to 0
//   app.get("/api/searchEvents", function(req, res) {
//     var skip = 0;
//     var limit = 15;
//     var sort = buildSort(req);

//     if(req.query.skip != null) {
//       skip = req.query.skip;
//     }

//     if(req.query.limit != null) {
//       limit = req.query.limit;
//     }

//     query = {}
//     if (req.query.event_type != null) {
//       query[event_type] = req.query.event_type
//     }

//     if (req.query.start_date != null && req.query.end_date != null) {
//       query[date] = {
//         $gte: ISODate(req.query.start_date),
//         $lte: ISODate(req.query.end_date)
//       }
//     }

//     if (req.query.min_budget != null && req.query.max_budget != null) {
//       query[fixed_price] = {
//         $gte: req.query.min_budget,
//         $lte: req.query.max_budget
//       }
//     }

//     if (req.query.booked != null) {
//       query[booked] = req.query.bookedl
//     }

//     if (req.query.lat != null && req.query.lon != null && req.query.distance) {
//       query[location] =   { $near :
//           {
//             $geometry: { type: "Point",  coordinates: [ req.query.lat, req.query.long] },
//             $minDistance: 0,
//             $maxDistance: req.query.distance
//           }
//        }
//     }

//     db.collection(EVENT_COLLECTION).find(query, null, {sort: sort, limit: limit, skip: skip}, function(err, docs) {
//       if (err) {
//        res.status(500).send();
//       } else {
//        res.send(docs);
//       }
//     });

//   });

//   // BOOKINGS
//   app.get("/api/bookings", function(req, res) {
//     db.collection(BOOKING_COLLECTION).findOne({ _id: new ObjectID(req.query.id) }, function(err, doc) {
//       if (err) {
//         handleError(res, err.message, "Failed to get booking");
//       } else {
//         res.status(200).json(doc);
//       }
//     });
//   });

//   app.post("/api/bookings", function(req, res) {
//     var newEvent = req.body;
//     db.collection(BOOKING_COLLECTION).insertOne(newEvent, function(err, doc) {
//       if (err) {
//         handleError(res, err.message, "Failed to create new booking.");
//       } else {
//         res.status(200).json(doc.ops[0]);
//       }
//     });
//   });

//   app.put("/api/bookings", function(req, res) {
//     var updateDoc = req.body;
//     delete updateDoc._id;

//     db.collection(BOOKING_COLLECTION).updateOne({ _id: new ObjectID(req.body.booking._id) }, updateDoc, function(err, doc) {
//       if (err) {
//         handleError(res, err.message, "Failed to update booking");
//       } else {
//         updateDoc._id = req.params.id;
//         res.status(200).json(updateDoc);
//       }
//     });
//   });

//   app.delete("/api/bookings", function(req, res) {
//     db.collection(BOOKING_COLLECTION).deleteOne({ _id: new ObjectID(req.body.booking._id) }, function(err, result) {
//       if (err) {
//         handleError(res, err.message, "Failed to delete booking");
//       } else {
//         // Delete all bookings for this event?
//         res.status(200).json(req.params.id);
//       }
//     });
//   });

//   // params
//   // user id
//   // limit
//   // skip
//   app.get("/api/userBookings", function(req, res) {
//     var limit = 10;
//     var skip = 0;

//     if (req.query.limit != null) {
//       limit = req.query.limit;
//     }

//     if (req.query.skip != null) {
//       skip = req.query.skip;
//     }

//     db.collection(BOOKING_COLLECTION).find( { _id: new ObjectID(req.body.user._id) }, function(err, doc) {
//       if (err) {
//         handleError(res, err.message, "Failed to get user bookings");
//       } else {
//         res.status(200).json(doc);
//       }
//     }).limit(limit).skip(skip);
//   });

//   app.delete("/api/userBookings", function(req, res) {
//     db.collection(BOOKING_COLLECTION).delete({ _id: req.query.id }, function(err, result) {
//       if (err) {
//         handleError(res, err.message, "Failed to delete user bookings");
//       } else {
//         res.status(200).json(req.params.id);
//       }
//     });
//   });
