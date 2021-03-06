'use strict';

module.exports = function(app) {
	var userHandlers = require('../controllers/userController.js');
	var spotifyHandlers = require('../controllers/spotifyController.js');

	// Users routes
	app.route('/api/users')
		.get(userHandlers.listAllUsers);

	app.route('/api/users/:uid')
		.get(userHandlers.getUserByID)
		.put(userHandlers.updateUserByID, spotifyHandlers.getFirstPlaylistByUIDAfterProfileUpdate)
		.delete(userHandlers.deleteUserByID);

	app.route('/api/searchUsers')
		.get(userHandlers.searchUsers);

	app.route('/api/genres')
		.get(userHandlers.getGenres);
		
	app.route('/api/userSorts')
	.get(userHandlers.getUserSortTypes);
};
