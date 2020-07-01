/*jshint esversion: 6 */
/*jshint esversion: 8 */
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//
exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection (from database)
  const tours = await Tour.find();

  // console.log("\nthe tours data from exports.getOverview\n");
  // console.log(tours);


  // 2) Build template


  // 3) Render that template using tour data from 1)

  res.status(200).render('overview', {
    title: 'All tours',
    tours: tours
  });

});

//middle ware used by router.get('/tour/:slug', viewsController.getTour); in viewRoutes.js
exports.getTour = catchAsync(async (req, res, next) => {
  //   1) get the data,
  // for the requested tour()

  const tour = await Tour.findOne({
    slug: req.params.slug
  }).populate({
    // path: 'reviews',
    path: 'reviews_Populated reviews_Populated_Counter',
    fields: 'review rating user'
  });

  // const tour = await Tour.findOne({
  //   slug: req.params.slug
  // }).populate({
  //   path: 'reviews',
  //   fields: 'review rating user'
  // });


  // console.log(tour);

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  // 2) Build template
  // 3) Render template using data from 1)
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour: tour
  });
});
