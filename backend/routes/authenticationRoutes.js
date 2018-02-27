'use strict';

module.exports = function(app) {
    
    /**
     * Authetication - the act of logging a user in
     */
    var tokenVerificationHandler = require('../controllers/tokenVerificationController.js');
	var autheticationHandler 	= require('../controllers/authenticationController.js');
	const passport 				= require('passport');
	const passportHandler 		= require('../controllers/passport.js');
	const verifyGoogleSignInWithPassport = passport.authenticate('googleToken', { session: false });

	app.route('/api/auth/register')
		.post(autheticationHandler.register);

	app.route('/api/auth/authenticate')
		.post(passportHandler.verifyLocalSignInWithPassport, autheticationHandler.signIn);

	app.route('/api/auth/authenticate/google')
		// .post(passport.authenticate('googleToken', { scope: ['openid', 'profile', 'email'] }), autheticationHandler.signIn);
		.post(verifyGoogleSignInWithPassport, autheticationHandler.googleOAuth);

	app.route('/api/auth/authenticate/twitter')
		// .post(passport.authenticate('googleToken', { scope: ['openid', 'profile', 'email'] }), autheticationHandler.signIn);
		.post(passport.authenticate('twitterToken', { session: false }), autheticationHandler.googleOAuth);

	app.route('/api/auth/passwordChange/:uid')
		.put(autheticationHandler.changePassword);

	app.route('/api/auth/logout')
		.post(autheticationHandler.logout);

	/**
	 * Routes for 3rd party account link
	 * 
	 * /api/auth/link/google
	 * /api/auth/link/facebook
	 * /api/auth/link/twitter
	 * /api/auth/link/spotify
	 * /api/auth/link/soundcloud
	 * 
	 * Routes for 3rd party account unlink
	 * /api/auth/unlink/google
	 * /api/auth/unlink/facebook
	 * /api/auth/unlink/twitter
	 * /api/auth/unlink/spotify
	 * /api/auth/unlink/soundcloud
	 * 
	 * 3rd party logins
	 * /api/auth/authenticate/google
	 * /api/auth/authenticate/facebook
	 * /api/auth/authenticate/twitter
	 * /api/auth/authenticate/spotify
	 * /api/auth/authenticate/soundcloud
	 * 
	 * Sign up email verify confirmation, resend
	 * /api/auth/verify
	 * /api/auth/verify/resend
	 * 
	 * TODO: Handle Two-step authentication via email code on login route
	 */

	

	/**
	 * Authorization - the act of verifying the access rights of a user to 
	 * interact with a resource. 
     * 
     * Can't be accessed without valid JWT.
	 * Need to pass JWT token in x-access-token header in the GET request
	 */
	app.route('/api/auth/whoami')
		// .get(tokenVerificationHandler.verifyToken, autheticationHandler.whoAmI);
		.get(passportHandler.verifyJWTWithPassport, autheticationHandler.whoAmI);
};
