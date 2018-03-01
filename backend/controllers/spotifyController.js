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

exports.sendTokens = function(req, res) {
  res.send({
      access_token: req.body.access_token,
      refresh_token: req.body.refresh_token,
      expires_in: req.body.expires_in
  });
}

exports.refreshAccessTokenMiddleware = function(req, res, next) {
  console.log('Token req is: ', req.body);
  var spotifyUserProfile = undefined;
  var authOptions = { 
    url : config.spotify.tokenUri,
    form: {
      grant_type: 'refresh_token',
      refresh_token: req.body.refresh_token
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(config.spotify.clientID + ':' + config.spotify.clientSecret).toString('base64'))
    },
    json: true
  };
  request.post(authOptions, function (err, response, body) {
    if (err === null && response.statusCode === 200) {
      //TODO: get the user id, save it and then return the user id along with the tokens
      console.log('Access Token Spotify: ', body.access_token,
        '\nRefresh token: ', body.refresh_token,
        '\nExpires_in:', body.expires_in);

      req.body.access_token = body.access_token;
      req.body.expires_in = body.expires_in;
      next();
    } else {
      console.log('Error refreshing spotify token', err, ', Code: ', response.statusCode, response.body);
      return res.status(500).send({ auth: false, message: 'Failed to refresh Spotify Token' });
    }
  });
}

exports.getMeAndSavetoDB = function(req, res) {
  console.log('Me body: ', req.body);
  // Get the user profile from /v1/me and add it to this user's model
  var authOptions = {
    url : 'https://api.spotify.com/v1/me',
    headers: {
      'Authorization': 'Bearer ' + req.body.access_token
    }
  }
  request.get(authOptions, function(err, response, body) {
    if (err === null && response.statusCode === 200) {
      console.log('Profile body received: ', body);
      const spotifyProfileObject = JSON.parse(body);
      let payload = {
            'spotify.id' : spotifyProfileObject.id,
            'spotify.email' : spotifyProfileObject.email,
            'spotify.uri' : spotifyProfileObject.uri,
            'spotify.href' : spotifyProfileObject.href,
            'spotify.accessToken' : req.body.access_token,
            'spotify.refreshToken' : req.body.refresh_token
      }
      
      User.findByIdAndUpdate(req.body.user._id, payload, { new: true }, function (err, user) {
        if (err) {
          // return res.status(520).send({ message: "Error finding the user from this UID...", error: err });
          console.log('Error saving the spotify profile data to user object');
        }
    
        user.hashPassword = undefined;
        res.send( {
          user: user
        });
      });
      
    } else {
      console.log('Error getting spotify user profile', err, ', Code: ', response.statusCode, response.body);    
    }
  });
}

exports.getAccessRefreshTokens = function (req, res) {
  console.log('Token req is: ', req.body);
  var spotifyUserProfile = undefined;
  var authOptions = { 
    url : config.spotify.tokenUri,
    form: {
      grant_type: 'authorization_code',
      code: req.body.code,
      redirect_uri: config.spotify.redirectUri
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(config.spotify.clientID + ':' + config.spotify.clientSecret).toString('base64'))
    },
    json: true
  };
  request.post(authOptions, function (err, response, body) {
    if (err === null && response.statusCode === 200) {
      //TODO: get the user id, save it and then return the user id along with the tokens
      console.log('Access Token Spotify: ', body.access_token,
        '\nRefresh token: ', body.refresh_token,
        '\nExpires_in:', body.expires_in);

      res.send(
        {
          access_token: body.access_token,
          refresh_token: body.refresh_token,
          expires_in: body.expires_in,
          user: spotifyUserProfile
        }
      );
    } else {
      console.log('Error getting spotify tokens', err, ', Code: ', response.statusCode);
    }
  });
}

exports.spotifyAuthorizeClient = function (req, res) {
  console.log('In spotify Authorize!');
  // Prepare the authorize spotify parameters.
  let parameters = {
    client_id: config.spotify.clientID,
    response_type: 'code',
    redirect_uri: config.spotify.redirectUri,
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
