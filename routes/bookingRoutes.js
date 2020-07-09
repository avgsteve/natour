/*jshint esversion: 6 */
/*jshint esversion: 8 */
const bookingController = require(`./../controllers/bookingController`);
const express = require('express');
const authController = require(`./../controllers/authController`);

const router = express.Router();

//router is for user to get session only
router.get('/checkout-session/:tourId', authController.protect, bookingController.getCheckoutSession);


module.exports = router;
