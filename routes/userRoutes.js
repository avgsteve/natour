/*jshint esversion: 6 */
/*jshint esversion: 8 */
const express = require('express');
const userController = require(`./../controllers/userController`);
const authController = require(`./../controllers/authController`);

// 2) ============== ROUTE-HANDLERS moved to userController.js

// 3) ============== ROUTES
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
// router.post('/resetPassword', authController.resetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch('/updateMyPassword', authController.protect, authController.updatePassword);

router.patch('/updateMe', authController.protect, userController.updateMe);

router.delete('/deleteMe', authController.protect, userController.deleteMe);


// 3-3) route actions for users
router.route('/').get(authController.protect, userController.getAllUsers).post(userController.createUser); //從 app.route('/api/v1/users').get 換成 router.route('/').get
// route actions for SINGLE user
router.route('/:id').get(userController.getUser).patch(authController.protect, userController.updateMe).delete(userController.deleteUser);

module.exports = router;
