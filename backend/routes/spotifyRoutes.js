'use strict';

module.exports = function(app) {
    
    /**
     * Authetication - the act of logging a user in
     */
    var tokenVerificationHandler = require('../controllers/tokenVerificationController.js');
    var spotifyHandler = require('../controllers/spotifyController.js');

    
    spotifyHandler.grantClientCredentials();

	app.route('/api/users/spotify/:username/playlists/')
        .get(spotifyHandler.getAllPlaylists);
        
    app.route('/api/users/spotify/:username/playlist/first/')
        .get(spotifyHandler.getFirstPlaylist);
        
    app.route('/api/users/spotify/:username/playlist/:playlist_id')
        .get(spotifyHandler.getPlaylistByID);
        
    app.route('/api/users/spotify/users/:uid/playlists/')
        .get(spotifyHandler.getAllPlaylistsByUID);

    app.route('/api/users/spotify/users/:uid/playlist/first')
        .get(spotifyHandler.getFirstPlaylistByUID);

    app.route('/api/users/spotify/users/:uid/playlist/:playlist_id')
        .get(spotifyHandler.getPlaylistByUIDandPID);
};
