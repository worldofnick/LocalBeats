'use strict';

module.exports = function(app) {
	var notificationHandlers = require('../controllers/notificationController.js');
	// var tokenVerificationHandler = require('../controllers/tokenVerificationController.js');

    // TODO: restrict access via user log in??

	app.route('/api/notification/:uid')
        .get(notificationHandlers.getNotificationsForUser)
};
