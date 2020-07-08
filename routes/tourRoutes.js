/*jshint esversion: 6 */
/*jshint esversion: 8 */
const tourController = require(`./../controllers/tourController`);
const express = require('express');
const authController = require(`./../controllers/authController`);
// const reviewController = require(`./../controllers/reviewController`);
const reviewRouter = require(`./reviewRoutes`);


// 2) ============== ROUTE-HANDLERS moved to tourController.js

// 3) ============== ROUTES
// Router 部分
const router = express.Router(); //原本是 const tourRouter = express.Router(); 因為需要按照convention去export router的關係就改掉

// 透過 param 去啟用 middleware
// router.param('id',tourController.checkID); //checkID位於 tourController裡面，未用到所以先被comment掉

// http://127.0.0.1:3000/api/v1/tours/top-5-cheap/
router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tours-stats').get(tourController.getTourStats);

router.route('/monthly-plan/:year').
get(authController.protect,
  authController.restrictTo('admin', 'lead-guide', 'guide'),
  tourController.getMonthlyPlan
);

//latlng = latitude & longitude, mi = miles
router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin);
// another example:  /tours-distance?distance=233&center=-40,45&&unit=mi
// this example:  /tours-distance/233/center/-45,45/unit/mi

//calculate the distances between two points
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);


//在 app.js裡面，使用app.use('/api/v1/tours', tourRouter); 來指定 router.route 使用哪一段網址為 router param ex: '/:id'
router.route('/')
  .get(tourController.getAllTours)
  .post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createTour); // post request 要先使用 checkReqBody middleware method

//
router.route('/:id')
  .get(tourController.getTour)

  .patch( //
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour)

  .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour);

// 以下是從app.js移過來，原本的的內容，改成以上方式 (by convention)
// const tourRouter = express.Router(); //
//
// tourRouter.route('/').get(getAllTours).post(createTour);
// tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

// =====================

// reference for nested ROUTES
// POST /tour/123abc112d/reviews
// GET /tour/123abc112d/reviews
// GET /tour/123abc112d/reviews/asdasd1231231fdf

// mounted Routes (userRouter.js): app.js => app.use('/api/v1/users', userRouter);
// mounted Routes (tourRouter.js): app.js => app.use('/api/v1/tours', tourRouter);

// for nesting the reviews in tour's URL route
// /:tourId/ is the id string nested after /api/v1/tours  .
// So the whole URL will be http://host/api/v1/tours/:tourId/reviews

// router.route('/:tourId/reviews').post(authController.protect, authController.restrictTo('user'), reviewController.createReviews);

// modify above (originally the route for nested URL) as below to refactor the nested URL codes
// Use middle ware reviewRouter for this specific route
router.use('/:tourId/reviews', reviewRouter);

/*
Since the code for /tour route in app.js is app.use('api/v1/tours', tourRouter),
so in current tourRoutes.js file, when using router.use('/:tourId/reviews', reviewRouter);
the route '/:tourId/reviews' will be the nested URL after 'api/v1/tours' again

*/


module.exports = router;
