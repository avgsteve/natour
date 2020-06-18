/*jshint esversion: 6 */
/*jshint esversion: 8 */
const reviewController = require(`./../controllers/reviewController`);
const express = require('express');
const authController = require(`./../controllers/authController`);

// const router = express.Router(); (modified as below codes for nesting routes)
const router = express.Router({
  mergeParams: true
});
//When mergeParams is set to true, the router (currently the reviewRoutes) can receive params value from other routes that are use current routes file (reviewRoutes)
// ex: In tourRoutes.js , the code: router.use('/:tourId/reviews', reviewRouter); can send the value in route variable :tourId and then the nested URL will be like /api/v1/tour/qwdqwd123123/review

// ref for mergeParams:  https://expressjs.com/en/api.html#express.router



router.route('/').get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    //setTourAndUserIdsforCreateReviews is used to create tourId and user.id in req.body for reviewController.createReviews
    reviewController.setTourAndUserIdsforCreateReviews,
    reviewController.createReviews);

router.route('/:id').patch(reviewController.updateReview).delete(reviewController.deleteReview);

module.exports = router;
