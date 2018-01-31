'use strict';

module.exports = function(app) {
	var stripeHandlers = require('../controllers/stripeController.js');

		app.route('/api/stripe/authorize')
			.get(stripeHandlers.stripeAuthorize);

    app.route('/api/stripe/link')
			.get(stripeHandlers.linkStripe);

		app.route('/api/stripe/transfers')
			.get(stripeHandlers.stripeTransfers);

		app.route('/api/stripe/payout')
			.post(stripeHandlers.stripePayout);

		app.route('/api/stripe/charge')
			.post(stripeHandlers.stripeCharge);

		app.route('/api/stripe/refund')
			.post(stripeHandlers.stripeRefund);

};
