'use strict';

module.exports = function(app) {
	var eventHandlers = require('../controllers/notificationController.js');
	// var tokenVerificationHandler = require('../controllers/tokenVerificationController.js');

    // TODO: restrict access via user log in??

	app.route('/api/notification/:eid')
        .get(eventHandlers.getNotificationsForUser)
        .post(eventHandlers.sendNotificationToUser)
};
