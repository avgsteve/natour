/*jshint esversion: 6 */
/*jshint esversion: 8 */
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/* !!! Set view engine and path with the code below in app.js in advance to make sure HTTP response obj can render the .pug files in designated folder

app.set('view engine', 'pug'); // will render .pug file to HTML format

//And create a path with a joined path name
app.set('views', path.join(__dirname, 'views')); // which is the "views" folder relatively located under app.js current folder

//Note: path is from another package imported to app.js

*/

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

// User's management page with the URL: host/me
exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};

//
exports.getLoginForm = catchAsync(async (req, res, next) => {

  // Render template "login.pug"
  res.status(200).render('login', {
    title: `Log into your account`,

    //- In the _header.pug file, there will be a "user" variable contains user document which come from res.locals.user
    //- created by isLoggedIn function in "authController.js" used by router.use(); in viewRoutes.js
    //- as a global middle ware pipeline
  });
});
