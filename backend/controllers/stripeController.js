'use strict';

var mongoose    = require('mongoose');
var stripe = require("stripe")("sk_test_XnYNA52kavV92IkcJyh1dQBw");
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
 exports.stripeLink = function (req, res) {
  if (req.session.state != req.query.state) {
     res.redirect('http://localhost:4200');
   }

   request.post('https://connect.stripe.com/express/oauth/authorize', {
     form: {
       grant_type: 'authorization_code',
       client_id: "ca_CE9KYxkI16Id3WqO6ypCkgnZsEqzLtWY",
       client_secret: "sk_test_XnYNA52kavV92IkcJyh1dQBw",
       code: req.query.code
     },
     json: true
   }, (err, response, body) => {
     if (err || body.error) {
       console.log('The Stripe onboarding process has not succeeded.');
       res.redirect('http://localhost:4200/profile/settings/success=false');
     } else {
       // Update the model and store the Stripe account ID in the DB.
       req.user.stripeAccountId = body.stripe_user_id;
       req.user.save();
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
    const loginLink = await stripe.accounts.createLoginLink(user.stripeAccountId);
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
      const balance = await stripe.balance.retrieve({ stripe_account: user.stripeAccountId });

      const { amount, currency } = balance.available[0]; // USD only
      // Create the instant payout.
      const payout = await stripe.payouts.create({
        method: 'instant',
        amount: amount,
        currency: currency,
        statement_descriptor: "Localbeats"
      }, {
        stripe_account: user.stripeAccountId
      });
    } catch (err) {
      console.log(err);
    }
    // Redirect to the user settings.
    return res.redirect('http://localhost:4200/profile/settings/payout=true');
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
