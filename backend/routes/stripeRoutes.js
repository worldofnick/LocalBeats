'use strict';

module.exports = function(app) {
	var stripeHandlers = require('../controllers/stripeController.js');
	var tokenVerificationHandler = require('../controllers/tokenVerificationController.js');

		app.route('/api/stripe/authorize')
			.post(stripeHandlers.stripeAuthorize);

    app.route('/api/stripe/link')
			.get(stripeHandlers.stripeLink);

		app.route('/api/stripe/transfers')
			.post(stripeHandlers.stripeTransfers);

		app.route('/api/stripe/payout')
			.post(stripeHandlers.stripePayout);

		app.route('/api/stripe/charge')
			.post(stripeHandlers.stripeCharge);

		app.route('/api/stripe/refund')
			.post(stripeHandlers.stripeRefund);

		app.route('/api/payments/bookingPaymentStatus')
			.get(stripeHandlers.bookingPaymentStatus);

};