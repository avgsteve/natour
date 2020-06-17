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

  //check if req.body.tour exists, if not, the create.tour property in .body obj,
  //and manually add current tour Id in the URL (from 'params property') to req.body.tour
  if (!req.body.tour) req.body.tour = req.params.tourId;

  // Check if req.body.user exists, if not, get property "id"'s value from req.user property
  // req.user is from previous middleware in route:  authController.protect in which function the req.user was created as below:
  // req.user = freshUser; // assign to fresh user data to req.user property and make it used by next middleware function
  if (!req.body.user) req.body.user = req.user.id;



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
  const newReview = await Review.create(req.body);



  res.status(201).json({
    status: "new review successfully created!",
    data: {
      newReview: newReview
    }
  });
});
