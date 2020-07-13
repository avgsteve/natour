/*jshint esversion: 6 */
/*jshint esversion: 8 */
const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

// ***The authController.isLoggedIn middle ware can store document
// from a logged-in user in response as "res.locals.user"
// so after this middle ware, all the .pug templates can access the "user" property as locals
// router.use(authController.isLoggedIn);

/* The for testing purpose
const router = express.Router();

//在 app.js 裡面，原本的寫法是 app.get
router.get('/', (req, res) => {
  //render base.pug
  res.status(200).render('base', {
    //This obj argument with properties is called "locals"
    //ref:  http://expressjs.com/en/5x/api.html#res.render
    tour: 'The Forest Hiker',
    user: 'Steve'
  });

  // note: This middle ware function reads setting from the code in this router.js file as below:
  // router.set('view engine', 'pug');
  // //will create a path with a joined path name
  // router.set('views', path.join(__dirname, 'views'));
});
*/


// Set alert message in res.locals.alert for.pug template to render corresponding alert message as pop-up in page
router.use(viewsController.alerts);

// default page for all tours
router.get('/',
  authController.isLoggedIn,
  viewsController.getOverview);

/*Note: authController.isLoggedIn,
  will check JWT in cookie and assign user data to res.locals
  as in "res.locals.user = currentUser;"
  for other functions to use the locals data
*/

// For routing to the individual page for tour details
// link from: overview.pug -->  a.btn.btn--green.btn--small(href=`/tour/${tour.slug}`) Details
router.get('/tour/:slug',
  authController.isLoggedIn,
  viewsController.getTour);

// Routing user to login page
router.get('/login',
  authController.isLoggedIn,
  viewsController.getLoginForm);

// User's personal data, reviews and password reset
router.get('/me',
  authController.protect,
  viewsController.getAccount);

// User's booking data
router.get('/my-tours',
  authController.protect,
  viewsController.getMyTours);


// Using form's attribute: action='/submit-user-data' method='POST' to update data
// Then reload the page by rendering account.pug file with the data from res.locals
router.post('/submit-user-data', authController.protect, viewsController.updateUserData);



module.exports = router;
