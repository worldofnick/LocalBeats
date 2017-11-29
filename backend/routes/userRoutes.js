'use strict';

module.exports = function(app) {
	var userHandlers = require('../controllers/userController.js');
	// var tokenVerificationHandler = require('../controllers/tokenVerificationController.js');

	// Users routes
	app.route('/api/users')
		.get(userHandlers.listAllUsers);
		// .post(userHandlers.loginRequired, events.hostEvent);   // TODO: Host event will go here

	app.route('/api/users/:uid')
		.get(userHandlers.getUserByID)
		.put(userHandlers.updateUserByID)
		.delete(userHandlers.deleteUserByID);

	app.route('/api/searchUsers')
		.get(userHandlers.searchUsersByName);
};
