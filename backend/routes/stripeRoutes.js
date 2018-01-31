'use strict';

module.exports = function(app) {
	var stripeHandlers = require('../controllers/stripeController.js');

		app.route('/api/stripe/authorize')
			.get(stripeHandlers.stripeAuthorize);

    app.route('/api/stripe/authorize')
			.get(stripeHandlers.linkStripe);

};
