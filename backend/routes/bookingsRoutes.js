'use strict';

module.exports = function(app) {
	var bookingsHandlers = require('../controllers/bookingsController.js');

    // TODO: restrict access via user log in??

    app.route('/api/bookings')
  		.get(bookingsHandlers.listAllBookings);

	app.route('/api/bookings/:bid')
        .get(bookingsHandlers.getBookingByID)
        .put(bookingsHandlers.updateBookingByID)
        .delete(bookingsHandlers.deleteBookingByID);

    app.route('/api/bookings/create')
        .post(bookingsHandlers.createBooking);

    app.route('/api/userBookings')
        .get(bookingsHandlers.getUserBookingsByUID);

	app.route('/api/userBooking')
        .delete(bookingsHandlers.deleteUserBookingsByUID);
        
    app.route('/api/acceptBooking/:bid')
        .put(bookingsHandlers.acceptBooking)

    app.route('/api/declineBooking/:bid')
        .put(bookingsHandlers.declineBooking)

};
