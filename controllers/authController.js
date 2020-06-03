/*jshint esversion: 6 */
/*jshint esversion: 8 */
const User = require('./../models/userModel');

//
exports.signup = async (req, res, next) => {

  //
  const newUser = await User.create(req.body);

  /*
  {
  	"name": "Test",
  	"email": "123@test.com",
  	"password": "pass123",
  	"passwordConfirm": "pass123"
  }
  */

  //
  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },

  });

};
