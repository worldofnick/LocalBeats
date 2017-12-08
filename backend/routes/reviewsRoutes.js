'use strict';

module.exports = function(app) {
	var reviewsHandlers = require('../controllers/reviewsController.js');

    // TODO: restrict access via user log in??

    app.route('/api/reviews')
  		.get(reviewsHandlers.listAllReviews);

	app.route('/api/reviews/:rid')
        .get(reviewsHandlers.getReviewByID)
        .put(reviewsHandlers.updateReviewByID)
        .delete(reviewsHandlers.deleteReviewByID);

    app.route('/api/reviews/create')
        .post(reviewsHandlers.createReview);

    app.route('/api/userReviewsTo')
        .get(reviewsHandlers.getUserReviewsByUIDTo);

    app.route('/api/userReviewsFrom')
        .get(reviewsHandlers.getUserReviewsByUIDFrom);
    
    app.route('/api/flagReview/:rid')
        .get(reviewsHandlers.flagReviewByID);

};
