'use strict';

var config = require('../../config');
var spotifyWebApi = require('spotify-web-api-node');
var mongoose = require('mongoose');
var User = mongoose.model('User');

/**
 * Set the credentials given on Spotify's My Applications page.
 * https://developer.spotify.com/my-applications
 */
var spotifyApi = new spotifyWebApi({
  clientId: config.spotifyClientID,
  clientSecret: config.spotifyClientSecret,
});

// This should work in node.js and other ES5 compliant implementations.
var isResultEmpty = function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

/**
 * Retrieve an access token
 */
exports.grantClientCredentials = function () {
  spotifyApi.clientCredentialsGrant()
    .then(function (data) {
      // console.log('The access token expires in ' + data.body['expires_in']);
      // console.log('The access token is ' + data.body['access_token']);

      // Save the access token so that it's used in future calls
      spotifyApi.setAccessToken(data.body['access_token']);
      console.log("-------------\nThe spotify CC grant body is :\n-------------");
      console.log(data.body);
      console.log("---------------\nSPOTIFY API VAR\n---------------");
      console.log(spotifyApi);
    }, function (err) {
      console.log('Something went wrong when retrieving an access token', err.message);
    });
};

/**
 * Get all the playlists of a user
 * @param {*} req - Contains username
 * @param {*} res - Contains the URI for the Spotify Playlist Widget
 */
exports.getAllPlaylists = function (req, res) {
  spotifyApi.getUserPlaylists(req.params.username)
    .then(function (data) {
      console.log('IS JSON EMPYT?: ', isResultEmpty(data.body));
      return res.status(200).send({ playlists: data.body });
    }, function (err) {
      return res.status(404).send({ message: "Something went wrong...", error: err });
      console.log('Something went wrong!', err);
    });
};

/**
 * Get the first playlist OWNED by this user. If the user 
 * has playlists but does not OWN any of those, then 404 is returned.
 * @param {*} req - Contains username
 * @param {*} res - Contains the URI for the Spotify Playlist Widget
 */
exports.getFirstPlaylist = function (req, res) {
  spotifyApi.getUserPlaylists(req.params.username)
    .then(function (data) {
      console.log('IS JSON EMPYT?: ', isResultEmpty(data.body));
      if (!isResultEmpty(data.body)) {
        // console.log(data.body);
        for (var playlist of data.body.items) {
          if (playlist.owner.id == req.params.username) {
            return res.status(200).send({ uri: playlist.uri });
          }
        }
        return res.status(404).send({ message: "None of the playlists belong to " + req.params.username });

      } else {
        return res.status(404).send({ message: req.params.username + " has no playlists!" });
      }

    }, function (err) {
      return res.status(404).send({ message: "Something went wrong...", error: err });
      console.log('Something went wrong!', err);
    });
};

/**
 * Get the playlist OWNED by this user via its ID. 
 * The username must be the OWNER of the playlist's ID.
 * @param {*} req - Contains username of the owner, id of the playlist
 * @param {*} res - Contains the URI for the Spotify Playlist Widget
 */
exports.getPlaylistByID = function (req, res) {
  spotifyApi.getPlaylist(req.params.username, req.params.playlist_id)
    .then(function (data) {
      console.log('\n-------------\nPlaylist: \n-------------\n', data.body);
      return res.status(200).send({ uri: data.body.uri });
    }, function (err) {
      return res.status(404).send({ message: "Something went wrong...", error: err });
      console.log('Something went wrong!', err);
    });
};

/**
 * Get all the playlists of a user by uid
 * @param {*} req - Contains uid
 * @param {*} res - Contains the URI for the Spotify Playlist Widget
 */
exports.getAllPlaylistsByUID = function (req, res) {

  var theUser;
  User.findById(req.params.uid, function (err, user) {
    if (err) {
      return res.status(404).send({ message: "Something went wrong...", error: err });
    }
    theUser = new User(user);
    console.log("USER: ");
    console.log(theUser.spotifyID);
    spotifyApi.getUserPlaylists(theUser.spotifyID)
      .then(function (data) {
        console.log('IS JSON EMPYT?: ', isResultEmpty(data.body));
        return res.status(200).send({ playlists: data.body });
      }, function (err) {
        console.log('Something went wrong!', err);
        return res.status(404).send({ message: "Something went wrong...", error: err });
      });
  });
};

/**
 * Get the first playlist OWNED by this user. If the user 
 * has playlists but does not OWN any of those, then 404 is returned.
 * @param {*} req - Contains uid
 * @param {*} res - Contains the URI for the Spotify Playlist Widget
 */
exports.getFirstPlaylistByUID = function (req, res) {
  User.findById(req.params.uid, function (err, user) {
    if (err) {
      return res.status(404).send({ message: "Something went wrong...", error: err });
    }
    spotifyApi.getUserPlaylists(user.spotifyID)
      .then(function (data) {
        console.log('IS JSON EMPYT?: ', isResultEmpty(data.body));
        if (!isResultEmpty(data.body)) {
          // console.log(data.body);
          for (var playlist of data.body.items) {
            if (playlist.owner.id == user.spotifyID) {
              return res.status(200).send({ uri: playlist.uri });
            }
          }
          return res.status(404).send({ message: "None of the playlists belong to " + user.firstName });

        } else {
          return res.status(404).send({ message: user.firstName + " has no playlists!" });
        }

      }, function (err) {
        return res.status(404).send({ message: "Something went wrong...", error: err });
        console.log('Something went wrong!', err);
      });
  });
};

/**
 * Get the playlist OWNED by this user via its PID and UID. 
 * The username must be the OWNER of the playlist's ID.
 * @param {*} req - Contains UID of the owner, id of the playlist
 * @param {*} res - Contains the URI for the Spotify Playlist Widget
 */
exports.getPlaylistByUIDandPID = function (req, res) {
  User.findById(req.params.uid, function (err, user) {
    if (err) {
      return res.status(404).send({ message: "Something went wrong...", error: err });
    }
    console.log("USER: ");
    console.log(user.spotifyID);
    spotifyApi.getPlaylist(user.spotifyID, req.params.playlist_id)
      .then(function (data) {
        console.log('\n-------------\nPlaylist: \n-------------\n', data.body);
        return res.status(200).send({ uri: data.body.uri });
      }, function (err) {
        return res.status(404).send({ message: "Something went wrong...", error: err });
        console.log('Something went wrong!', err);
      });
  });
};
