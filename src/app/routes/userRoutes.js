'use strict';

module.exports = function(app) {
	var userHandlers = require('../controllers/userController.js');
	var tokenVerificationHandler = require('../controllers/tokenVerificationController.js');
	var autheticationHandler = require('../controllers/authenticationController.js');

	// Users routes
	app.route('/api/users')
		.get(userHandlers.listAllUsers);
		// .post(userHandlers.loginRequired, events.hostEvent);   // TODO: Host event will go here

	app.route('/api/users/:uid')
		.get(userHandlers.getUserByID)
		.put(userHandlers.updateUserByID)
		.delete(userHandlers.deleteUserByID);

	// Authentication Routes
	app.route('/api/auth/register')
		.post(autheticationHandler.register);

	app.route('/api/auth/authenticate')
		.post(autheticationHandler.signIn);

	app.route('/api/auth/logout')
		.get(autheticationHandler.logout);

	/**
	 * Authorization - the act of verifying the access rights of a user to 
	 * interact with a resource. Can't be accessed without valid JWT.
	 * Need to pass JWT token in x-access-token header in the GET request
	 */
	app.route('/api/auth/whoami')
		.get(tokenVerificationHandler.verifyToken, autheticationHandler.whoAmI);
};
