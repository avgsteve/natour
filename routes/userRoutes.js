/*jshint esversion: 6 */
/*jshint esversion: 8 */
const express = require('express');
const multer = require('multer'); // https://www.npmjs.com/package/multer
const userController = require(`./../controllers/userController`);
const authController = require(`./../controllers/authController`);
const viewsController = require(`./../controllers/viewsController`);


// const reviewController = require(`./../controllers/reviewController`);

// 2) ============== ROUTE-HANDLERS moved to userController.js

// 3) ============== ROUTES
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Let user log out by sending a token that expires immediately
router.get('/logout', authController.logout);


router.post('/forgotPassword', authController.forgotPassword);

// router.post('/resetPassword', authController.resetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// ==== Protect all the routes below this code ===
// ref:  http://expressjs.com/en/api.html#router.use
router.use(authController.protect);

// for any logged in users
router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);

router.patch('/updateMe', userController.uploadUserPhoto, userController.updateMe); // update user by sending
// router.patch('/updateMe', authController.protect, viewsController.updateUserData);

router.delete('/deleteMe', userController.deleteMe);

// ==== Restrict the route middle ware to 'admin' use only  ===
router.use(authController.restrictTo('admin'));

// 3-3) route actions for users ex: http://host/api/v1/users
router.route('/').get(userController.getAllUsers).post(userController.createUser); //從 app.route('/api/v1/users').get 換成 router.route('/').get
// route actions for SINGLE user ex: http://host/api/v1/users/theId123
router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);
module.exports = router;
