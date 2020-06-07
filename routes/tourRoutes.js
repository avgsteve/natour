/*jshint esversion: 6 */
/*jshint esversion: 8 */
const tourController = require(`./../controllers/tourController`);
const express = require('express');
const authController = require(`./../controllers/authController`);


// 2) ============== ROUTE-HANDLERS moved to tourController.js

// 3) ============== ROUTES
// Router 部分
const router = express.Router(); //原本是 const tourRouter = express.Router(); 因為需要按照convention去export router的關係就改掉

// 透過 param 去啟用 middleware
// router.param('id',tourController.checkID); //checkID位於 tourController裡面，未用到所以先被comment掉

// http://127.0.0.1:3000/api/v1/tours/top-5-cheap/
router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);


router.route('/tours-stats').get(tourController.getTourStats);

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);


//在 app.js裡面，使用app.use('/api/v1/tours', tourRouter); 來指定 router.route 使用哪一段網址為 router param ex: '/:id'
router.route('/').get(authController.protect, tourController.getAllTours).post(tourController.createTour); // post request 要先使用 checkReqBody middleware method
router.route('/:id').get(tourController.getTour).patch(tourController.updateTour).delete(tourController.deleteTour);

// 以下是從app.js移過來，原本的的內容，改成以上方式 (by convention)
// const tourRouter = express.Router(); //
//
// tourRouter.route('/').get(getAllTours).post(createTour);
// tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
