/**
 * secret: used when we create and verify JSON Web Tokens
 * database: the URI with username and password to your MongoDB installation
 */
module.exports = {
    'secret': 'pikachuineedyou',
    'database': 'mongodb://heroku_dmq914qm:v52suq480nk5qf4m6fh7p5v901@ds147265.mlab.com:47265/heroku_dmq914qm',
    'spotifyClientID' : '9b266aeaa5904de699d2864591f4e248',
    'spotifyClientSecret' : 'ced120445fe74bdca660090161898476',

    // Configuration for Stripe.
    stripe: {
      secretKey: 'sk_test_XnYNA52kavV92IkcJyh1dQBw',
      publishableKey: 'pk_test_4Uybz0SKSGBZjSFdxsLVCEZH',
      clientId: 'ca_CE9KYxkI16Id3WqO6ypCkgnZsEqzLtWY',
      authorizeUri: 'https://connect.stripe.com/express/oauth/authorize',
      tokenUri: 'https://connect.stripe.com/oauth/token'
    }

};
//TODO: change those hard-coded values to process.env after adding to Heroku