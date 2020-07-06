/*jshint esversion: 6 */
/*jshint esversion: 8 */
const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

// Move this route handler above router.use(authController.isLoggedIn);
// to prevent the other routes are protected twice by .protect and .isLoggedIn
router.get('/me', authController.protect, viewsController.getAccount);

// ***The authController.isLoggedIn middle ware can store document
// from a logged-in user in response as "res.locals.user"
// so after this middle ware, all the .pug templates can access the "user" property as locals
router.use(authController.isLoggedIn);

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

// ======= DEFAULT PAGE AND PAGES FOR EACH TOUR DETAILS =======

// default page for all tours
router.get('/', viewsController.getOverview);

// For routing to the individual page for tour details
// link from: overview.pug -->  a.btn.btn--green.btn--small(href=`/tour/${tour.slug}`) Details
router.get('/tour/:slug', authController.protect, viewsController.getTour);

// Routing user to login page
router.get('/login', viewsController.getLoginForm);

// For receiving data (as in req.body's properties data) from form (class='form-user-data')
router.post('/submit-user-data', authController.protect, viewsController.updateUserData);



module.exports = router;
