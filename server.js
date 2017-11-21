var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var USERS_COLLECTION = "users";

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

 app.get("/api/profile/:id", function(req, res) {
   db.collection(USERS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
     if (err) {
       handleError(res, err.message, "Failed to get user");
     } else {
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

 app.put("/api/user/:id", function(req, res) {
   var updateDoc = req.body;
   delete updateDoc._id;

   db.collection(USERS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
     if (err) {
       handleError(res, err.message, "Failed to update user");
     } else {
       updateDoc._id = req.params.id;
       res.status(200).json(updateDoc);
     }
   });
 });

 app.delete("/api/user/:id", function(req, res) {
   db.collection(USERS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
     if (err) {
       handleError(res, err.message, "Failed to delete user");
     } else {
       res.status(200).json(req.params.id);
     }
   });
 });
