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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// MIDDLEWARE
// app.use(function(req, res, next) {
//   if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
//     jsonwebtoken.verify(req.headers.authorization.split(' ')[1], 'RESTFULAPIs', function(err, decode) {
//       if (err) req.user = undefined;
//       req.user = decode;
//       next();
//     });
//   } else {
//     req.user = undefined;
//     next();
//   }
// });

// =================================================================
// API Routes
// =================================================================

var routes = require('./src/app/routes/userRoutes.js');
routes(app);

// basic route (http://localhost:8080)
app.get('/', function(req, res) {
  res.send('Welcome the EXPRESS Server! This API is at http://localhost:' + port + '/api');
});

// =======================
// Start the Server ======
// =======================
// app.listen(port);
// console.log('Magic happens at http://localhost:' + port);

app.use(function(req, res) {
  res.status(404).send({ url: req.originalUrl + ' not found' })
});

app.listen(port);

console.log('Magic happens at http://localhost:' + port);

module.exports = app;