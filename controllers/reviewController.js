/*jshint esversion: 6 */
/*jshint esversion: 8 */
const Review = require("./../models/reviewModel");
// const catchAsync = require("./../utils/catchAsync");
const logCurrentModuleName = require("./../utils/getFunctionName");
const factory = require('./handlerFactory'); //exports.deleteOne = Model => catchAsync(async (req, res, next) => { ...


//setTourAndUserIds: a middle ware used to set properties in req.body for and before exports.createReviews middle ware
exports.setTourAndUserIdsforCreateReviews = (req, res, next) => {
  //check if req.body.tour exists, if not, the create.tour property in .body obj,
  //and manually add current tour Id in the URL (from 'params property') to req.body.tour
  if (!req.body.tour) req.body.tour = req.params.tourId;

  // Check if req.body.user exists, if not, get property "id"'s value from req.user property
  // req.user is from previous middleware in route:  authController.protect in which function the req.user was created as below:
  // req.user = freshUser; // assign to fresh user data to req.user property and make it used by next middleware function
  if (!req.body.user) req.body.user = req.user.id;

  // These two properties in req.body as tourId and user.id have the fields and value needed for creating new view data (via reviewSchema in viewModel.js)
  next();
};


//
exports.getAllReviews = factory.getAll(Review);

//
exports.getReview = factory.getOne(Review);

//
exports.createReviews = factory.createOne(Review);

/* To create new review in the nested URL,

  #1 In POSTMAN body:
  {
    "rating" : 4,
    "review" : "Great and fun!"
}

  #2 In revierModel.js , the exported module Review has the schema property:

  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Review must belong to a tour.']
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user.']
  },

  these two fields can use the properties of :  req.body.tour & req.body.user
  from req.body (as created above) that are passed in as argument to Review.create(req.body) as below

  */

exports.updateReview = factory.updateOne(Review);

//pass the Review document to the factory function to get the returned result from Model.findByIdAndDelete
exports.deleteReview = factory.deleteOne(Review);
