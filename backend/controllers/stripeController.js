'use strict';

var mongoose    = require('mongoose');
var querystring = require('querystring');
var request     = require('request');
var jwt         = require('jsonwebtoken');
var bcrypt      = require('bcrypt');
var User        = mongoose.model('User');
var config      = require('../../config.js');

// ====== USER ROUTES ======

/**
 * GET /api/stripe/authorize
 *
 * Redirect to Stripe to set up payments.
 */
exports.stripeAuthorize = function (req, res) {
  req.session.state = Math.random().toString(36).slice(2);
  // Prepare the mandatory Stripe parameters.
  let parameters = {
  client_id: "ca_CE9KYxkI16Id3WqO6ypCkgnZsEqzLtWY",
  state: req.session.state
  };

  // Optionally, Stripe Connect accepts `first_name`, `last_name`, `email`,
  // and `phone` in the query parameters for them to be autofilled.
  parameters = Object.assign(parameters, {
    'stripe_user[business_type]': 'individual',
    'stripe_user[first_name]': req.user.firstName || undefined,
    'stripe_user[last_name]': req.user.lastName || undefined,
    'stripe_user[email]': req.user.email,
  });

  // Redirect to Stripe to start the Connect onboarding.
  res.redirect('https://connect.stripe.com/express/oauth/authorize' + '?' + querystring.stringify(parameters));
};

/**
 * GET /api/stripe/token
 *
 * Connect the new Stripe account to the platform account.
 */
 exports.linkStripe = function (req, res) {
  if (req.session.state != req.query.state) {
     res.redirect('http://localhost:8080');
   }

   request.post('https://connect.stripe.com/express/oauth/authorize', {
     form: {
       grant_type: 'authorization_code',
       client_id: "ca_CE9KYxkI16Id3WqO6ypCkgnZsEqzLtWY",
       client_secret: "sk_live_m5pb2VOgwuecNyE0IASsLuzG",
       code: req.query.code
     },
     json: true
   }, (err, response, body) => {
     if (err || body.error) {
       console.log('The Stripe onboarding process has not succeeded.');
       res.redirect('http://localhost:8080/profile/settings/success=false');
     } else {
       // Update the model and store the Stripe account ID in the DB.
       req.user.stripeAccountId = body.stripe_user_id;
       req.user.save();
     }
     // Redirect to the final stage.
     res.redirect('http://localhost:8080/profile/settings/success=true');
   });


 };
