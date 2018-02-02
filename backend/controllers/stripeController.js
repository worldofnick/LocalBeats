'use strict';

var mongoose    = require('mongoose');
var config      = require('../../config.js');
var stripe      = require("stripe")(config.stripe.secretKey);
var querystring = require('querystring');
var request     = require('request');
var jwt         = require('jsonwebtoken');
var bcrypt      = require('bcrypt');
var User        = mongoose.model('User');

// ====== STRIPE ROUTES ======

/**
 * GET /api/stripe/authorize
 *
 * Redirect to Stripe to set up payments.
 */
exports.stripeAuthorize = function (req, res) {
  // Prepare the mandatory Stripe parameters.
  let parameters = {
    client_id: config.stripe.clientId,
    state: Math.random().toString(36).slice(2)
  };

  // Optionally, Stripe Connect accepts `first_name`, `last_name`, `email`,
  // and `phone` in the query parameters for them to be autofilled.
  parameters = Object.assign(parameters, {
    'stripe_user[business_type]': 'individual',
    'stripe_user[first_name]': req.body.user.firstName || undefined,
    'stripe_user[last_name]': req.body.user.lastName || undefined,
    'stripe_user[email]': req.body.user.email,
  });

  // Redirect to Stripe to start the Connect onboarding.
  res.send({"redirect_url": config.stripe.authorizeUri + '?' + querystring.stringify(parameters)});
};

/**
 * GET /api/stripe/token
 *
 * Connect the new Stripe account to the Localbeats account.
 */
 exports.stripeLink = function (req, res) {
  // if (req.session.state != req.query.state) {
  //    res.redirect('http://localhost:4200');
  //  }

   request.post(config.stripe.tokenUri, {
     form: {
       grant_type: 'authorization_code',
       client_id: config.stripe.clientId,
       client_secret: config.stripe.secretKey,
       code: req.query.code
     },
     json: true
   }, (err, response, body) => {
     if (err || body.error) {
       console.log('The Stripe onboarding process has not succeeded.');
       res.redirect('http://localhost:4200/profile/settings/success=false');
     } else {
       // Update the model and store the Stripe account ID in the DB.
       console.log("req");
       console.log(req);
       console.log("body");
       console.log(body);
       User.update({email: req.user.email}), {
            stripeAccountId: body.stripe_user_id
        }, function(err, numberAffected, rawResponse) {
      }

     }
     // Redirect to the final stage.
     res.redirect('http://localhost:4200/profile/settings/success=true');
   });

 };

 /**
 * GET /api/stripe/transfers
 *
 * Redirect to Stripe to view transfers and edit payment details.
 */
exports.stripeTransfers = function (req, res) {
  const user = req.user;
  if (!user.stripeAccountId) {
    return res.redirect('http://localhost:4200/auth');
  }
  try {
    // Generate a unique login link for the associated Stripe account.
    const loginLink = stripe.accounts.createLoginLink(user.stripeAccountId);
    // Retrieve the URL from the response and redirect the user to Stripe.
    return res.redirect(loginLink.url);
  } catch (err) {
    console.log('Failed to create a Stripe login link.');
    return res.redirect('http://localhost:4200/auth');
  }

};


 /**
 * POST /api/stripe/payout
 *
 * Generate an instant payout with Stripe for the available balance.
 */
 exports.stripePayout = function (req, res) {
    const user = req.user;
    try {
      // Fetch the account balance for find available funds.
      const balance = stripe.balance.retrieve({ stripe_account: user.stripeAccountId });

      const { amount, currency } = balance.available[0]; // USD only
      // Create the instant payout.
      const payout = stripe.payouts.create({
        method: 'instant',
        amount: amount,
        currency: currency,
        statement_descriptor: "Localbeats"
      }, {
        stripe_account: user.stripeAccountId
      });
    } catch (err) {
      res.sendStatus(500)
    }
    // Give the OK
    res.sendStatus(200);
 };


 /**
 * POST /api/stripe/charge
 * TODO
 * Creates a Stripe charge
 */
 exports.stripeCharge = function (req, res) {
   // TODO
  stripe.charges.create({
    amount: 1000,
    currency: "usd",
    source: "tok_visa",
    destination: {
      account: "{CONNECTED_STRIPE_ACCOUNT_ID}",
    },
  }).then(function(charge) {
    // asynchronously called
  });
 };

 /**
 * POST /api/stripe/refund
 * TODO
 * Issues a refund for the given transaction
 */
 exports.stripeRefund = function (req, res) {
   stripe.refunds.create({
    charge: req.body.payment.stripeChargeId,
    reverse_transfer: true,
  }).then(function(refund) {
    // asynchronously called
  });
 };
