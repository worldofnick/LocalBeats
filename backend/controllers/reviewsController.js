'use strict';

var mongoose    = require('mongoose');
var jwt         = require('jsonwebtoken');
var bcrypt      = require('bcrypt');
var Reviews      = mongoose.model('Review');
var config    = require('../../config.js');

// ====== Reviews ROUTES ======

exports.listAllReviews = function (req, res) {
    Reviews.find({}, function (err, reviews) {
      if (err)
        return res.send(err);
            
        return res.status(200).send({"reviews": reviews});
    });
};

exports.getReviewByID = function (req, res) {
  Reviews.findById(req.params.rid, function (err, review) {
      if (err) {
          return res.status(500).send("Failed to get review");
      } else {
          return res.status(200).send({ "review": review });
      }
  });
};

exports.createReview = function (req, res) {
    var newReview = new Reviews(req.body.review);
    newReview.save(function (err, review) {
        if (err) {
            return res.status(400).send({
                message: err,
                description: "Failed to create a review"
            });
        } else {
            return res.status(200).send({ "review": review });
        }
    });
};

exports.updateReviewByID = function (req, res) {
    Reviews.findByIdAndUpdate(req.params.rid, req.body.review, { new: true }, function (err, review) {
        if (err) {
            return res.status(500).send("There was a problem updating the review.");
        }
        return res.status(200).send({ "review": review });
    });
};

exports.deleteReviewByID = function (req, res) {
    Reviews.findByIdAndRemove(req.params.bid, function (err, review) {
        if (err) {
            return res.status(500).send("There was a problem deleting the review.");
        } else {
            if (review == null) {
                return res.status(200).send("Review was already deleted.");
            } else {
                return res.status(200).send("Review removed");
            }
        }
    });
};

exports.getUserReviewsByUIDTo = function (req, res) {
  var limit = 10;
  var skip = 0;

  if (req.params.limit != null) {
      limit = parseInt(req.query.limit);

  }

  if (req.params.skip != null) {
      skip = parseInt(req.query.skip);
  }

  Reviews.find({toUID: req.query.uid}).limit(limit).skip(skip).exec(function (err, doc) {
      if (err) {
          return res.status(500).send("Failed to get user reviews");
      } else {
            return res.status(200).send({"reviews": doc});
      }
  });
};

exports.getUserReviewsByUIDFrom = function (req, res) {
  var limit = 10;
  var skip = 0;

  if (req.params.limit != null) {
      limit = parseInt(req.query.limit);

  }

  if (req.params.skip != null) {
      skip = parseInt(req.query.skip);
  }

  Reviews.find({fromUID: req.query.uid}).limit(limit).skip(skip).exec(function (err, doc) {
      if (err) {
          return res.status(500).send("Failed to get user reviews");
      } else {
          return res.status(200).send({"reviews": doc});
      }
  });
};

exports.flagReviewByID = function(req, res) {
    var update = { $inc: { flagCount: 1 }};
    Reviews.update({ _id: req.params.rid }, update, function(err, numberAffected, rawResponse) {
        return res.status(200).send("Flagged review.");
    })
};
