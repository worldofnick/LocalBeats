'use strict';

module.exports = function(app) {
	var bookingsHandlers = require('../controllers/bookingsController.js');

    // TODO: restrict access via user log in??

	app.route('/api/bookings/:eid')
        .get(bookingsHandlers.getBookingByID)
        .put(bookingsHandlers.updateBookingByID)
        .delete(bookingsHandlers.deleteBookingByID);

    app.route('/api/bookings/create')
        .post(bookingsHandlers.createBooking);
    //
    // app.route('/api/userEvents')
    //     .get(eventHandlers.getUserEventsByUID);
    //
		// app.route('/api/userEvents')
		// 		.delete(eventHandlers.deleteUserEventsByUID);


};
