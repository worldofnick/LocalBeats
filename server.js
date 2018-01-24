// =================================================================
// Get the packages we need
// =================================================================
var express 		= require('express');
var app         	= express();
var bodyParser  	= require('body-parser');
var morgan      	= require('morgan');
var mongoose    	= require('mongoose');
var http = require('http');
var jwt    = require('jsonwebtoken');                // used to create, sign, and verify tokens
var config = require('./config');                    // get our config file
var User   = require('./backend/models/userModel');  // get our mongoose model
var Events = require('./backend/models/eventsModel');  // get our mongoose model
var Bookings = require('./backend/models/bookingsModel');
var Notification = require('./backend/models/notificationModel');
var io = require('socket.io')(server);


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

//original server instatiation
// var server = app.listen(port, function () {
//   var port = server.address().port;
//   console.log("App now running on port", port);
// });

// var server = http.createServer(app);
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(8080);
//

//set up socket

//

io.on('connection', function(socket){  
  console.log("user connected");              
  socket.on('create notification', function(data){   
    socket.broadcast.emit('new notification',data);  
  });
});

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
userRoutes(app);
authenticationRoutes(app);
eventsRoutes(app);
bookingsRoutes(app);
spotifyRoutes(app);
notificationRoutes(app);


// basic route (http://localhost:8080)
app.get('/', function(req, res) {
  res.send('Welcome the EXPRESS Server! This API is at http://localhost:' + port + '/api');
});
console.log('Magic happens at http://localhost:' + port);

module.exports = app;
