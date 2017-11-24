var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var USERS_COLLECTION = "users";
var EVENT_COLLECTION = "events";
var BOOKING_COLLECTION = "bookings";

var app = express();
app.use(bodyParser.json());

// Create link to Angular build directory
var distDir = __dirname + "/dist/";
app.use(express.static(distDir));

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*  "/api/profile"
 *    GET: gets a user profile info by an id
 *    POST: creates a new profile
 *    PUT: updates a users profile by an id
 *    DELETE: delets a users profile by an id
 */
 app.get("/api/user/", function(req, res) {
   db.collection(USERS_COLLECTION).findOne({ _id: new ObjectID(req.body.user.uid) }, function(err, doc) {
     if (err) {
       handleError(res, err.message, "Failed to get user");
     } else {
       db.collection(EVENT_COLLECTION).deleteMany({ uid : req.body.user.uid }) // Also delete all events owned by this user
       res.status(200).json(doc);
     }
   });

 });

 app.post("/api/user", function(req, res) {
   var newUser = req.body;
   db.collection(USERS_COLLECTION).insertOne(newUser, function(err, doc) {
     if (err) {
       handleError(res, err.message, "Failed to create new user.");
     } else {
       res.status(201).json(doc.ops[0]);
     }
   });
 });

 app.put("/api/user/", function(req, res) {
   var updateDoc = req.body;
   delete updateDoc._id;

   db.collection(USERS_COLLECTION).updateOne({uid: req.body.user.uid}, updateDoc, function(err, doc) {
     if (err) {
       handleError(res, err.message, "Failed to update user");
     } else {
       updateDoc._id = req.params.id;
       res.status(200).json(updateDoc);
     }
   });
 });

 app.delete("/api/user/", function(req, res) {
   db.collection(USERS_COLLECTION).deleteOne({ uid: req.body.user.uid }, function(err, result) {
     if (err) {
       handleError(res, err.message, "Failed to delete user");
     } else {
       res.status(200).json(req.params.id);
     }
   });
 });


 /*  "/api/events"
  *    GET: gets an event form an id
  *    POST: creates a new event
  *    PUT: updates an event by id
  *    DELETE: delets an event by id
  */
  // Get all events owned by a user
  // Get all events in geo space
  // Get all events matching some filter

  app.get("/api/events", function(req, res) {
    db.collection(EVENT_COLLECTION).findOne({ eid: req.body.event.eid }, function(err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to get event");
      } else {
        res.status(200).json(doc);
      }
    });
  });

  app.post("/api/events", function(req, res) {
    var newEvent = req.body;
    db.collection(EVENT_COLLECTION).insertOne(newEvent, function(err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to create new event.");
      } else {
        res.status(201).json(doc.ops[0]);
      }
    });
  });

  app.put("/api/events", function(req, res) {
    var updateDoc = req.body;
    delete updateDoc._id;

    db.collection(EVENT_COLLECTION).updateOne({eid: req.body.event.eid}, updateDoc, function(err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to update event");
      } else {
        updateDoc._id = req.params.id;
        res.status(200).json(updateDoc);
      }
    });
  });

  app.delete("/api/events", function(req, res) {
    db.collection(EVENT_COLLECTION).deleteOne({ eid: req.body.event.eid }, function(err, result) {
      if (err) {
        handleError(res, err.message, "Failed to delete event");
      } else {
        // Delete all bookings for this event?
        res.status(200).json(req.params.id);
      }
    });
  });

  app.get("/api/userEvents", function(req, res) {
    db.collection(EVENT_COLLECTION).find({ uid: req.body.user.uid }, function(err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to get user events");
      } else {
        res.status(200).json(doc);
      }
    });
  });

  app.delete("/api/userEvents", function(req, res) {
    db.collection(EVENT_COLLECTION).delete({ uid: req.body.user.uid }, function(err, result) {
      if (err) {
        handleError(res, err.message, "Failed to delete user events");
      } else {
        // Delete all bookings for this event?
        res.status(200).json(req.params.id);
      }
    });
  });


  // BOOKINGS
  app.get("/api/bookings", function(req, res) {
    db.collection(BOOKING_COLLECTION).findOne({ bid: req.body.booking.bid }, function(err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to get event");
      } else {
        res.status(200).json(doc);
      }
    });
  });

  app.post("/api/bookings", function(req, res) {
    var newEvent = req.body;
    db.collection(BOOKING_COLLECTION).insertOne(newEvent, function(err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to create new event.");
      } else {
        res.status(201).json(doc.ops[0]);
      }
    });
  });

  app.put("/api/bookings", function(req, res) {
    var updateDoc = req.body;
    delete updateDoc._id;

    db.collection(BOOKING_COLLECTION).updateOne({ bid: req.body.booking.bid }, updateDoc, function(err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to update event");
      } else {
        updateDoc._id = req.params.id;
        res.status(200).json(updateDoc);
      }
    });
  });

  app.delete("/api/bookings", function(req, res) {
    db.collection(BOOKING_COLLECTION).deleteOne({ bid: req.body.booking.bid }, function(err, result) {
      if (err) {
        handleError(res, err.message, "Failed to delete event");
      } else {
        // Delete all bookings for this event?
        res.status(200).json(req.params.id);
      }
    });
  });

  app.get("/api/userBookings", function(req, res) {
    db.collection(BOOKING_COLLECTION).find({ uid: req.body.user.uid }, function(err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to get user bookings");
      } else {
        res.status(200).json(doc);
      }
    });
  });

  app.delete("/api/userBookings", function(req, res) {
    db.collection(BOOKING_COLLECTION).delete({ uid: req.body.user.uid }, function(err, result) {
      if (err) {
        handleError(res, err.message, "Failed to delete user bookings");
      } else {
        res.status(200).json(req.params.id);
      }
    });
  });
