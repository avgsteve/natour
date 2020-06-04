/*jshint esversion: 6 */
/*jshint esversion: 8 */
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
//
exports.signup = catchAsync(async (req, res, next) => {
  //
  // const newUser = await User.create(req.body);
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  //
  // jwt.sign(payload, secretOrPrivateKey, [options, callback])
  const token = jwt.sign({
      //first argument : payload:
      id: newUser._id // from MongoDB's _id property;
      //to decode  the id:  https://jwt.io/
    },
    //second argument : secretOrPrivateKey
    process.env.JWT_SECRET,
    // fast way to generate quick and easy way to generate JWT secret. In terminal: node -e "console.log(require('crypto').randomBytes(64).toString('hex'));"
    //ref:  https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/learn/lecture/15065292#questions/8159650

    { //third argument
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  );


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
    token: token,
    data: {
      user: newUser,
    },

  });
});
