// =================================================================
// get the packages we need ========================================
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
// configuration ===================================================
// =================================================================
var port = process.env.PORT || 8080;        // used to create, sign, and verify tokens
mongoose.connect(config.database);          // connect to database
app.set('superSecret', config.secret);      // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// =================================================================
// routes ==========================================================
// =================================================================

// basic route (http://localhost:8080)
app.get('/', function(req, res) {
  res.send('Hello! The API is at http://localhost:' + port + '/api');
});

/**
 * Add dummy user to the DB
 */
app.get('/setup', function(req, res) {
  
    // create a sample user
    var nick = new User({ 
      email: 'Balbasaur@pokemon.com', 
      password: 'password',
      admin: true 
    });
  
    // save the sample user
    nick.save(function(err) {
      if (err) throw err;
  
      console.log('User saved successfully');
      res.json({ success: true });
    });
  });

// =================================================================
// API routes ======================================================
// =================================================================

// get an instance of the router for api routes
var apiRoutes = express.Router(); 

// Route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRoutes.post('/authenticate', function (req, res) {

  // find the user
  User.findOne({
    email: req.body.email
  }, function (err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

        // if user is found and password is right
        // create a token with only our given payload
        // we don't want to pass in the entire user since that has the password
        const payload = {
          user: {
            email: user.email,
            admin: user.admin
          }
        };
        var token = jwt.sign(payload, app.get('superSecret'), {
          // expiresInMinutes: 1440 // expires in 24 hours
        });

        // return the information including token as JSON
        res.json({
          success: true,
          message: "Here's your JWT token!",
          token: token
        });
      }

    }

  });
});

// TODO: route middleware to verify a token

// route to show a random message (GET http://localhost:8080/api/)
apiRoutes.get('/', function(req, res) {
  res.json({ message: 'Welcome to the coolest API on earth!' });
});

// route to return all users (GET http://localhost:8080/api/users)
apiRoutes.get('/users', function(req, res) {
  User.find({}, function(err, users) {
    res.json(users);
  });
});   

// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);













// =======================
// start the server ======
// =======================
app.listen(port);
console.log('Magic happens at http://localhost:' + port);