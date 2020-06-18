/*jshint esversion: 6 */
/*jshint esversion: 8 */
const Review = require("./../models/reviewModel");
const catchAsync = require("./../utils/catchAsync");
const logCurrentModuleName = require("./../utils/getFunctionName");

//
exports.getAllReviews = catchAsync(async (req, res, next) => {

  // the filter obj to be used as in Review.find(filter) to get reviews for certain "tour" documents
  let filter = {};

  /* Get params from the nested URL: ex: http://host/api/v1/tours/:tourId/reviews

  If there's property req.params.tourId
  from router.use('/:tourId/reviews', reviewRouter) in touRoutes.js
  (which handles this part of URL: /api/v1/tours in app.use('/api/v1/tours', tourRouter);
 in app.js)

  and via the express.Router's option "mergeParams: true" in reviewRoutes.js,
  then we can get value from req.params.tourId in current file (reviewController.js) then assign the value to filter obj
*/
  if (req.params.tourId) filter = {
    tour: req.params.tourId,
    // // optional filters:
    // rating: {
    //   $gte: 4
    // },
  };

  // console.log(`Current Module name is: ${Object.keys(this)[0]}`); //	['getAllReviews', 'createReviews']
  // logCurrentModuleName();

  console.log("\nthe filter obj");
  console.log(filter); // { tour: '5ee78ffdc4ecd526f8f636e3' }

  // Find all documents that match selector. The result will be an array of documents.
  // await Query.prototype.find(filter, optional: callback)
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
