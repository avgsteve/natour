/*jshint esversion: 6 */
/*jshint esversion: 8 */

const express = require('express');

//
// 2) ============== ROUTE-HANDLERS
const getAllUsers = (req, res) => {
  // 500 Internal Server Error
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
const getUser = (req, res) => {
  // 500 Internal Server Error
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
const createUser = (req, res) => {
  // 500 Internal Server Error
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
const updateUser = (req, res) => {
  // 500 Internal Server Error
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
const deleteUser = (req, res) => {
  // 500 Internal Server Error
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

// 3) ============== ROUTES
const router = express.Router();
// 3-3) route actions for users
router.route('/').get(getAllUsers).post(createUser); //從 app.route('/api/v1/users').get 換成 router.route('/').get
// route actions for SINGLE user
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
