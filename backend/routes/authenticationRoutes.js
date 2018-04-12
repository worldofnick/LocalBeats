'use strict';

module.exports = function(app) {
    
    /**
     * Authetication - the act of logging a user in
     */
    var tokenVerificationHandler = require('../controllers/tokenVerificationController.js');
	var autheticationHandler = require('../controllers/authenticationController.js');

	app.route('/api/auth/magicLink')
		.post(autheticationHandler.sendMagicLink);

	app.route('/api/auth/captcha/verify')
		.post(autheticationHandler.verifyReCaptchaWithGet);
	
	app.route('/api/auth/social/google/verifyIdToken')
		.post(autheticationHandler.verifyGoogleIdToken);
	
	app.route('/api/auth/social/google/signin')
		.post(autheticationHandler.signInWithGoogle);

	app.route('/api/auth/verifyLocalJwt')
		.post(autheticationHandler.verifyLocalJwtAndReturnUser);

	app.route('/api/auth/register')
		.post(autheticationHandler.register);

	app.route('/api/auth/authenticate/demo')
		.post(autheticationHandler.signInDemoMode);

	app.route('/api/auth/passwordChange/:uid')
		.put(autheticationHandler.changePassword);

	app.route('/api/auth/logout')
		.post(autheticationHandler.logout);

	/**
	 * Authorization - the act of verifying the access rights of a user to 
	 * interact with a resource. 
     * 
     * Can't be accessed without valid JWT.
	 * Need to pass JWT token in x-access-token header in the GET request
	 */
	app.route('/api/auth/whoami')
		.get(tokenVerificationHandler.verifyToken, autheticationHandler.whoAmI);
};
