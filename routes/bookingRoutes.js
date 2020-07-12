/*jshint esversion: 6 */
/*jshint esversion: 8 */
const bookingController = require(`./../controllers/bookingController`);
const express = require('express');
const authController = require(`./../controllers/authController`);

const router = express.Router();
//  ==== In app.js, ====
// app.use('/api/v1/bookings', bookingRouter);

router.use(authController.protect);

//router is for user to get session only //
router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);


router.use(authController.restrictTo('admin', 'lead-guide'));

router.route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router.route('/:id')
  .get(bookingController.getOneBooking)
  .post(bookingController.createBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);



module.exports = router;
