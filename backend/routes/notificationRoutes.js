'use strict';

module.exports = function(app) {
	var notificationHandlers = require('../controllers/notificationController.js');

	app.route('/api/notification/:uid')
		.get(notificationHandlers.getNotificationsForUser);
	
	app.route('/api/notification/:nid')
		.delete(notificationHandlers.deleteNotificationsByID);
};
