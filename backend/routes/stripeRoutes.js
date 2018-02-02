'use strict';

module.exports = function(app) {
	var stripeHandlers = require('../controllers/stripeController.js');
	var tokenVerificationHandler = require('../controllers/tokenVerificationController.js');

		app.route('/api/stripe/authorize')
			.post(tokenVerificationHandler.verifyToken, stripeHandlers.stripeAuthorize);

    app.route('/api/stripe/link')
			.get(tokenVerificationHandler.verifyToken, stripeHandlers.stripeLink);

		app.route('/api/stripe/transfers')
			.post(stripeHandlers.stripeTransfers);

		app.route('/api/stripe/payout')
			.post(stripeHandlers.stripePayout);

		app.route('/api/stripe/charge')
			.post(stripeHandlers.stripeCharge);

		app.route('/api/stripe/refund')
			.post(stripeHandlers.stripeRefund);

};
