'use strict';

module.exports = function(app) {
    var contactUsHandler = require('../controllers/contactController.js');

    app.route('/api/contactUs')
		.post(contactUsHandler.contactUs);
};