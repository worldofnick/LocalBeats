'use strict';

module.exports = function(app) {
    
    /**
     * Authetication - the act of logging a user in
     */
    var tokenVerificationHandler = require('../controllers/tokenVerificationController.js');
    var spotifyHandler = require('../controllers/spotifyController.js');
    spotifyHandler.grantClientCredentials();

    app.route('/api/spotify/authorize')
        .post(spotifyHandler.spotifyAuthorizeClient);      //Add token verification
    
    // Gets access, refresh tokens
    app.route('/api/spotify/getAuthTokens')
        .post(spotifyHandler.getAccessRefreshTokens);
    
    // Get the user profile for the passed access token and saves it to DB
    // Header: access_token : Authorization Bearer <access_token>
    app.route('/api/spotify/me')
        .post(spotifyHandler.getMeAndSavetoDB)

    // Routes using the SPOTIFY_USERNAME
	app.route('/api/users/spotify/:username/playlists/')
        .get(spotifyHandler.getAllPlaylists);
        
    app.route('/api/users/spotify/:username/playlist/first/')
        .get(spotifyHandler.getFirstPlaylist);
        
    app.route('/api/users/spotify/:username/playlist/:playlist_id')
        .get(spotifyHandler.getPlaylistByID);
        
    // Routes using the normal UID
    app.route('/api/users/spotify/users/:uid/playlists/')
        .get(spotifyHandler.getAllPlaylistsByUID);

    app.route('/api/users/spotify/users/:uid/playlist/first')
        .get(spotifyHandler.getFirstPlaylistByUID);

    app.route('/api/users/spotify/users/:uid/playlist/:playlist_id')
        .get(spotifyHandler.getPlaylistByUIDandPID);
};
