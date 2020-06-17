/*jshint esversion: 6 */
/*jshint esversion: 8 */
const Review = require("./../models/reviewModel");
const catchAsync = require("./../utils/catchAsync");
const logCurrentModuleName = require("./../utils/getFunctionName");

//
exports.getAllReviews = catchAsync(async (req, res, next) => {
	// DisplayCurrentFunctionName();

	// console.log(this); //{ getAllReviews: [Function], createReviews: [Function] }

	console.log(`Current Module name is: ${Object.keys(this)[0]}`); //	['getAllReviews', 'createReviews']

	// logCurrentModuleName();

	const reviews = await Review.find();

	res.status(200).json({
		status: "successfully get all reviews",
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
		status: "new review successfully created!",
		data: {
			newReview: newReview
		}
	});
});
