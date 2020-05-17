/*jshint esversion: 6 */
/*jshint esversion: 8 */
const fs = require('fs');
const tourController = require(`./../controllers/tourController`);
const express = require('express');

// 2) ============== ROUTE-HANDLERS moved to tourController.js

// 3) ============== ROUTES
// Router 部分
const router = express.Router(); //原本是 const tourRouter = express.Router(); 因為需要按照convention去export router的關係就改掉

// ==== 使用 papram (':/id') 的 middleware，檢查id內容是否正確
// router.param middleware will be triggered by the setup of other middleware router.route()
router.param('id', tourController.checkID);

//在 app.js裡面，使用app.use('/api/v1/tours', tourRouter); 來指定 router.route 使用哪一段網址為 router param ex: '/:id'
router.route('/').get(tourController.getAllTours).post(tourController.checkReqBody, tourController.createTour); // post request 要先使用 checkReqBody middleware method
router.route('/:id').get(tourController.getTour).patch(tourController.updateTour).delete(tourController.deleteTour);

// 以下是從app.js移過來，原本的的內容，改成以上方式 (by convention)
// const tourRouter = express.Router(); //
//
// tourRouter.route('/').get(getAllTours).post(createTour);
// tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
