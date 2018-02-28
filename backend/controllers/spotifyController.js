'use strict';

var config = require('../../config');
var spotifyWebApi = require('spotify-web-api-node');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var querystring = require('querystring');
var request     = require('request');

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

exports.spotifyAuthorizeClient = function (req, res) {
  console.log('In spotify Authorize!');
  // Prepare the authorize spotify parameters.
  let parameters = {
    client_id: config.spotify.clientID,
    response_type: 'code',
    redirect_uri: 'http://localhost:4200/callback/spotify', //TODO: change to heroku, etc
    scope: 'user-read-private user-read-email'
  };

  // Redirect to spotify to ask for permissions.
  console.log('Authorize SPotify URL : ',config.spotify.authorizeUri + '?' + querystring.stringify(parameters) )
  res.send({"redirect_url": config.spotify.authorizeUri + '?' + querystring.stringify(parameters)});
}

/**
 * Retrieve server side only access token
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
      return res.status(530).send({ message: "Invalid spotifyID...", error: err });
      console.log('Invalid spotifyID...', err);
    });
};

/**
 * Get the first playlist OWNED by this user. 
 * @param {*} req - Contains username
 * @param {*} res - Contains the URI for the Spotify Playlist Widget
 */
exports.getFirstPlaylist = function (req, res) {
  spotifyApi.getUserPlaylists(req.params.username)
    .then(function (data) {
      console.log('IS JSON EMPYT?: ', isResultEmpty(data.body));
      if (!isResultEmpty(data.body)) {
        console.log(data.body);
        for (var playlist of data.body.items) {
          if (playlist.owner.id == req.params.username) {
            return res.status(200).send({ uri: playlist.uri });
          }
        }
        return res.status(230).send({ uri: "", message: "None of the playlists belong to " + req.params.username });

      } else {
        return res.status(230).send({ uri: "", message: req.params.username + " has no playlists!" });
      }

    }, function (err) {
      return res.status(530).send({ message: "Invalid spotifyID...", error: err });
      console.log('Invalid spotifyID...', err);
    });
};


/**
 * Middleware that returns the first playlist OWNED by this user 
 * after a porfile update.
 * @param {*} req - Contains the uid
 * @param {*} res - Contains the URI for the Spotify Playlist Widget
 */
exports.getFirstPlaylistByUIDAfterProfileUpdate = function (req, res) {
  User.findById(req.params.uid, function (err, user) {
    if (err) {
      return res.status(520).send({ message: "Error finding the user from this UID in spotify...", error: err });
    }
    spotifyApi.getUserPlaylists(user.spotifyID)
      .then(function (data) {
        console.log('IS JSON EMPYT?: ', isResultEmpty(data.body));
        if (!isResultEmpty(data.body)) {
          // console.log(data.body);
          for (var playlist of data.body.items) {
            if (playlist.owner.id == user.spotifyID) {
              user.hashPassword = undefined;
              return res.status(200).send({ user: user, uri: playlist.uri });
            }
          }
          user.hashPassword = undefined;
          return res.status(230).send({ user: user, uri: "", message: "None of the playlists belong to " + user.firstName });

        } else {
          user.hashPassword = undefined;
          return res.status(230).send({ user: user, uri: "", message: user.firstName + " has no playlists!" });
        }

      }, function (err) {
        return res.status(530).send({ message: "Invalid spotifyID...", error: err });
        console.log('Invalid spotifyID...', err);
      });
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
      return res.status(530).send({ message: "Invalid spotifyID...", error: err });
      console.log('Invalid spotifyID...', err);
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
      return res.status(520).send({ message: "Invalid UID in spotify findByID", error: err });
    }
    theUser = new User(user);
    console.log("USER: ");
    console.log(theUser.spotifyID);
    spotifyApi.getUserPlaylists(theUser.spotifyID)
      .then(function (data) {
        console.log('IS JSON EMPYT?: ', isResultEmpty(data.body));
        return res.status(200).send({ playlists: data.body });
      }, function (err) {
        console.log('Invalid spotifyID...', err);
        return res.status(530).send({ message: "Invalid spotifyID...", error: err });
      });
  });
};

/**
 * Get the first playlist OWNED by this user. 
 * @param {*} req - Contains uid
 * @param {*} res - Contains the URI for the Spotify Playlist Widget
 */
exports.getFirstPlaylistByUID = function (req, res) {
  User.findById(req.params.uid, function (err, user) {
    if (err) {
      return res.status(520).send({ message: "Invalid UID in spotify findByID", error: err });
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
          return res.status(230).send({ uri: "", message: "None of the playlists belong to " + user.firstName });

        } else {
          return res.status(230).send({ uri: "", message: user.firstName + " has no playlists!" });
        }

      }, function (err) {
        return res.status(530).send({ message: "Invalid spotifyID...", error: err });
        console.log('Invalid spotifyID...', err);
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
      return res.status(520).send({ message: "Invalid UID in spotify findByID", error: err });
    }
    console.log("USER: ");
    console.log(user.spotifyID);
    spotifyApi.getPlaylist(user.spotifyID, req.params.playlist_id)
      .then(function (data) {
        console.log('\n-------------\nPlaylist: \n-------------\n', data.body);
        return res.status(200).send({ uri: data.body.uri });
      }, function (err) {
        return res.status(530).send({ message: "Invalid spotifyID...", error: err });
        console.log('Invalid spotifyID...', err);
      });
  });
};
