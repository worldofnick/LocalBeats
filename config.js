/**
 * secret: used when we create and verify JSON Web Tokens
 * database: the URI with username and password to your MongoDB installation
 */
module.exports = {
    'secret': 'pikachuineedyou',
    'database': 'mongodb://heroku_dmq914qm:v52suq480nk5qf4m6fh7p5v901@ds147265.mlab.com:47265/heroku_dmq914qm'
};
//TODO: change those hard-coded values to process.env after adding to Heroku