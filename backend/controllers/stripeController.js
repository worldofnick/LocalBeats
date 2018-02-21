'use strict';

var mongoose    = require('mongoose');
var config      = require('../../config.js');
var stripe      = require("stripe")(config.stripe.secretKey);
var querystring = require('querystring');
var request     = require('request');
var jwt         = require('jsonwebtoken');
var bcrypt      = require('bcrypt');
var User        = mongoose.model('User');
var Payments        = mongoose.model('Payments');

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
       res.redirect('https://localbeats.herokuapp.com/profile/stripe/?success=false');
     } else {
       // Update the model and store the Stripe account ID in the DB.
       stripe.accounts.retrieve(
         body.stripe_user_id,
         function(err, account) {
           if (err) {
             res.redirect('https://localbeats.herokuapp.com/profile/stripe/?success=false');
           }

           console.log(account.email);
           console.log(body.stripe_user_id);
           User.findOne({email: account.email}, function (err, user) {
             console.log("found user");
            user.stripeAccountId = body.stripe_user_id;
            user.save(function (err) {
              if(err) {
                console.error('error saving stripe id to account');
              }
            });
          });

         }
       );
     }
     // Redirect to the final stage.
     res.redirect('https://localbeats.herokuapp.com/profile/stripe/?success=true');
   });

 };

 /**
 * GET /api/stripe/transfers
 *
 * Redirect to Stripe to view transfers and edit payment details.
 */
exports.stripeTransfers = function (req, res) {
  const user = req.body.user;
  if (!user.stripeAccountId) {
    res.send({"redirect_url": 'http://localbeats.herokuapp.com/auth'});
  }
  try {
    // Generate a unique login link for the associated Stripe account.
    const loginLink = stripe.accounts.createLoginLink(user.stripeAccountId);
    // Retrieve the URL from the response and redirect the user to Stripe.
    res.send({"redirect_url": loginLink.url});
  } catch (err) {
    console.log('Failed to create a Stripe login link.');
    res.send({"redirect_url": 'http://localbeats.herokuapp.com/auth'});
  }

};


 /**
 * POST /api/stripe/payout
 *
 * Generate an instant payout with Stripe for the available balance.
 */
 exports.stripePayout = function (req, res) {
    const user = req.body.user;
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
      res.sendStatus(500);
    }
    // Give the OK
    res.sendStatus(200);
 };


 /**
 * POST /api/stripe/charge
 *
 * Creates a Stripe charge
 */
 exports.stripeCharge = function (req, res) {
   const booking = req.body.booking;

   if (!booking.approved) {
     res.sendStatus(403);
   }

  stripe.charges.create({
    amount: booking.currentPrice,
    currency: "usd",
    source: "tok_visa",
    destination: {
      account: booking.hostUser.stripeAccountId,
    },
  }).then(function(charge) {
    // asynchronously called

    // Create new payment
    var payment = new Payments();
    payment.hostUser = booking.hostUser;
    payment.performerUser = booking.performerUser;
    payment.booking =  booking;
    payment.amount =  booking.currentPrice;
    payment.date = new Date();
    payment.stripeChargeId = charge.id; // check if this is right
    payment.type = "charge";

    payment.save();

    res.sendStatus(200);
  });
  res.sendStatus(500);
 };

 /**
 * POST /api/stripe/refund
 *
 * Issues a refund for the given transaction
 */
 exports.stripeRefund = function (req, res) {
   const payment = req.body.payment;
   const booking = payment.booking;

   stripe.refunds.create({
    charge: payment.stripeChargeId,
    reverse_transfer: true,
  }).then(function(refund) {
    // asynchronously called
    var payment = new Payments();
    payment.hostUser = booking.hostUser;
    payment.performerUser = booking.performerUser;
    payment.booking =  booking
    payment.amount =  booking.currentPrice;
    payment.date = new Date();
    payment.stripeChargeId = charge.id; // check if this is right
    payment.type = "refund";

    payment.save();
    res.sendStatus(200);
  });
  res.sendStatus(500);
 };

 /**
  * GET /api/payments/bookingPaymentStatus
  *
  * Sends back the payment status for a bid.
  * Either {"paid", "refunded", "waiting"}
  */
 exports.bookingPaymentStatus = function (req, res) {
   // Find the last payment associated with this event
   var query = { booking: req.query.bid };
   var sort = {_id: -1};
   
   Payments.find(query).limit(1).skip(0).sort(sort).exec(function (err, payment) {
     if (payment.type == "payment") {
       res.send({"status": "paid"});
     } else if (payment.type == "refund") {
       res.send({"status": "refund"});
     } else if (payment.type == "cancellation") {
      res.send({"status": "cancellation"});
     }
   });
   res.send({"status": "waiting"});
 };


  /**
  * PUT /api/payments/cancel
  * Params: Booking via body, cancel_type={host-cancel, artist-cancel}
  * Sends back 200 for a good cancel charge, 500 otherwise
  */
  exports.cancelBoookingFee = function (req, res) {
    // If cancel_type == "host-cancel", then charge the host
    var stripeAccountId = req.body.booking.hostUser;
    if (req.query.cancel_type == "artist-cancel") {
      stripeAccountId = req.body.booking.performerUser;
    }
    var feeAmount = booking.currentPrice * 0.15;
    stripe.charges.create({
      amount: feeAmount,
      currency: "usd",
      source: "tok_visa",
      destination: {
        account: stripeAccountId,
      },
    }).then(function(charge) {
      // asynchronously called
  
      // Create new payment
      var payment = new Payments();
      payment.hostUser = booking.hostUser;
      payment.performerUser = booking.performerUser;
      payment.booking =  booking;
      payment.amount =  booking.currentPrice;
      payment.date = new Date();
      payment.stripeChargeId = charge.id; // check if this is right
      payment.type = "cancellation";
  
      payment.save();
  
      res.sendStatus(200);
    });

    res.sendStatus(500);
  };

  /**
  * GET /api/payments/bookingPayments
  *
  * Sends back an array of payments associated with a booking via bid
  */
  exports.bookingPayments = function (req, res) {
    // Find all payments associated with a booking
    var query = { booking: req.query.bid };
    
    Payments.find(query).exec(function (err, payments) {
      if (err) {
        res.status(403).send({"error": "Error in MongoDB"});
      } else {
        res.send({"payments": payments})
      }
    });
    res.send({"status": "waiting"});
  };