/*jshint esversion: 6 */
/*jshint esversion: 8 */
const Tour = require('../models/tourModel');
const User = require('../models/userModel'); //to get user's document data
const Booking = require('../models/bookingModel'); //to get user's document data
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

// User's management page with the URL: host/me. No need to verify user or set locals again
exports.getAccount = (req, res, next) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};


// Render booked tours in user's page
exports.getMyTours = catchAsync(async (req, res, next) => {

  // 1) Find all bookings with matched user id collection of Booking model and document

  // Use current user's id  in req.user (from authController.protect) to query document's value in "user" field
  const bookings = await Booking.find({
    user: req.user.id
  });

  // "bookings" will be an Array contains all Booking documents are matched with user id

  console.log('\n === bookings :=== \n');
  console.log(bookings);

  // 2) Find the tour id within the booking documents, then return the tour id as a new array (by iterating the bookings data for the tour Object nested in booking Object)
  const tourIDs = bookings.map(el => el.tour._id);

  console.log('\n === tourIDs :=== \n');
  console.log(tourIDs);

  const tours = await Tour.find({
    //Then find the documents in Tour collection with the field "_id" and matched tour Id from variable "tourIDs"

    _id: {
      $in: tourIDs,
      // [{ // This code works, too!
      //     _id: "5c88fa8cf4afda39709c2974",
      //     name: 'The Northern Lights',
      //   },
      //   {
      //     _id: "5c88fa8cf4afda39709c295d",
      //     name: 'The Northern Lights',
      //   }
      // ]
    }
  });

  console.log('\n === tours :=== \n');
  console.log(tours);

  res.status(200).render('overview', {
    title: 'My tours',
    tours: tours,
  });
});


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

// update user with form . from html
// function is used by router.post('/submit-user-data', authController.protect, viewsController.updateUserData);
// in routes/viewRoutes.js
exports.updateUserData = catchAsync(async (req, res, next) => {

  console.log("\x1b[32m" + "\n-- The req.body for updating user from \nby using form's attribute: action='/submit-user-data' method='POST' to update data WITHOUT using API on certain routes \n" + "\x1b[0m");
  console.log("  (function location: updateUserData function in routes/viewRoutes.js)\n");
  console.log(req.body);

  /* For receiving and parsing body.req correctly with data sent from form,
     need to add app.use(express.urlencoded); in app.use to parse data in req.body

        app.use(express.urlencoded({
          extended: true,
          limit: '10kb'
        }));

     ref:  https://expressjs.com/en/api.html#express.urlencoded
*/

  // Find the user document for updating the content later
  const updatedUser = await User.findByIdAndUpdate(
    // 1st argument: The id to be used to look up in DB for finding the document
    req.user.id,
    // 2nd argument: field and content to be updated
    {
      name: req.body.name,
      email: req.body.email,
    },
    // 3rd argument: option. ref: https://mongoosejs.com/docs/api.html#query_Query-findOneAndUpdate
    {
      //update document as new document will add a property "isNew" with value "true"
      new: true,
      runValidator: true,
      //ref
    });


  res.status(200).render('account', {
    title: 'Your account with updated info:',
    user: updatedUser,
    // then this "user" property will be assigned to res.locals which can be used by account.pug
    // such as user.name,  user.email
  });

  console.log("\n -- res.locals:");
  console.log(res.locals);

  console.log("\n -- res.message:");
  console.log(res.locals);

  console.log("\n" + "\x1b[32m" + "-- End of the log for updating user from form (class='form-user-data') : \n" + "\x1b[0m");


});
