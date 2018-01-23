'use strict';

module.exports = function(app) {
	var eventHandlers = require('../controllers/eventsController.js');
	// var tokenVerificationHandler = require('../controllers/tokenVerificationController.js');

    // TODO: restrict access via user log in??

	// Event routes
	app.route('/api/notification')
		.get(eventHandlers.listAllEvents);
		// .post(userHandlers.loginRequired, events.hostEvent);   // TODO: Host event will go here

	app.route('/api/notification/:eid')
        .get(eventHandlers.getNotificationsForUser)
        .put(eventHandlers.sendNotificationToUser)

};
