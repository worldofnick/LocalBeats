// =================================================================
// Get the packages we need
// =================================================================
var express 	  = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');

var jwt    = require('jsonwebtoken');                // used to create, sign, and verify tokens
var config = require('./config');                    // get our config file
var User   = require('./src/app/models/userModel');  // get our mongoose model
var Events = require('./src/app/models/eventsModel');  // get our mongoose model
var Bookings = require('./src/app/models/bookingsModel');

var distDir = __dirname + "/dist/";
app.use(express.static(distDir));           // Create link to Angular build directory

// =================================================================
// Configuration
// =================================================================
var port = process.env.PORT || 8080;        // used to create, sign, and verify tokens
mongoose.Promise = global.Promise;
mongoose.connect(config.database);          // connect to database
app.set('superSecret', config.secret);      // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

var server = app.listen(port, function () {
  var port = server.address().port;
  console.log("App now running on port", port);
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// =================================================================
// API Routes
// =================================================================

var userRoutes = require('./src/app/routes/userRoutes.js');
var authenticationRoutes = require('./src/app/routes/authenticationRoutes.js');
var eventsRoutes = require('./src/app/routes/eventsRoutes.js');
var bookingsRoutes = require('./src/app/routes/bookingsRoutes.js');
userRoutes(app);
authenticationRoutes(app);
eventsRoutes(app);
bookingsRoutes(app);


// basic route (http://localhost:8080)
app.get('/', function(req, res) {
  res.send('Welcome the EXPRESS Server! This API is at http://localhost:' + port + '/api');
});
console.log('Magic happens at http://localhost:' + port);

module.exports = app;