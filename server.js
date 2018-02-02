// =================================================================
// Get the packages we need
// =================================================================
const express 		  = require('express');
const app         	= express();
const bodyParser  	= require('body-parser');
const morgan      	= require('morgan');
const mongoose    	= require('mongoose');
const http          = require('http');
const async         = require('async');
const socketIO      = require('socket.io');
const jwt           = require('jsonwebtoken');                // used to create, sign, and verify tokens

const config = require('./config')
var User   = require('./backend/models/userModel');  // get our mongoose model
var Events = require('./backend/models/eventsModel');  // get our mongoose model
var Bookings = require('./backend/models/bookingsModel');
var Notification = require('./backend/models/notificationModel');
var Payments = require('./backend/models/paymentModel');


var distDir = __dirname + "/dist/";
app.use(express.static(distDir));           // Create link to Angular build directory

// =================================================================
// Configuration
// =================================================================
var port = process.env.PORT || 8080;
mongoose.Promise = global.Promise;
mongoose.connect(config.database);          // connect to database
app.set('superSecret', config.secret);      // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// =================================================================
// HTTP Server and SOCKET.io setup
// =================================================================
const server = http.Server(app);
const io     = socketIO(server);
server.listen(port, function () {
  console.log('\n=========\nBackend HTTP server and socket listening on port: ', port, '\n=========\n');
});
app.set('io', io);

// =================================================================
// Compatibility fix
// =================================================================
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Cache-Control");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  next();
});

// =================================================================
// API Routes
// =================================================================

var userRoutes            = require('./backend/routes/userRoutes.js');
var authenticationRoutes  = require('./backend/routes/authenticationRoutes.js');
var eventsRoutes          = require('./backend/routes/eventsRoutes.js');
var bookingsRoutes        = require('./backend/routes/bookingsRoutes.js');
var spotifyRoutes 		    = require('./backend/routes/spotifyRoutes.js');
var notificationRoutes 		= require('./backend/routes/notificationRoutes.js');
var stripeRoutes 		      = require('./backend/routes/stripeRoutes.js');
userRoutes(app);
authenticationRoutes(app);
eventsRoutes(app);
bookingsRoutes(app);
spotifyRoutes(app);
notificationRoutes(app);
stripeRoutes(app);


// basic route (http://localhost:8080)
app.get('/', function(req, res) {
  res.send('Welcome the EXPRESS Server! This API is at http://localhost:' + port + '/api');
});
console.log('Magic happens at http://localhost:' + port);

module.exports = app;
