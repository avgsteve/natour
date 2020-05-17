/*jshint esversion: 6 */
/*jshint esversion: 8 */
const userController = require(`./../controllers/userController`);

const express = require('express');

// 2) ============== ROUTE-HANDLERS moved to userController.js

// 3) ============== ROUTES
const router = express.Router();
// 3-3) route actions for users
router.route('/').get(userController.getAllUsers).post(userController.createUser); //從 app.route('/api/v1/users').get 換成 router.route('/').get
// route actions for SINGLE user
router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

module.exports = router;
