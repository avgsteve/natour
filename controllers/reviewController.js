/*jshint esversion: 6 */
/*jshint esversion: 8 */
const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');


//
exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();

  res.status(200).json({
    status: 'successfully get all reviews',
    results: reviews.length,
    data: {
      reviews: reviews
    }
  });

});


//
exports.createReviews = catchAsync(async (req, res, next) => {
  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'new review successfully created!',
    data: {
      newReview: newReview
    }
  });

});
