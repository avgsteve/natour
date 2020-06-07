/*jshint esversion: 6 */
/*jshint esversion: 8 */
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');

//getting token with jwt.sign method by passing in the id as argument
const signToken = id => {

  // jwt.sign(payload, secretOrPrivateKey, [options, callback])
  return jwt.sign({
      //first argument : payload:
      id: id // from MongoDB's _id property;
      //to decode  the id:  https://jwt.io/
    },
    //second argument : secretOrPrivateKey
    process.env.JWT_SECRET,
    // fast way to generate quick and easy way to generate JWT secret. In terminal: node -e "console.log(require('crypto').randomBytes(64).toString('hex'));"
    // ref:  https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/learn/lecture/15065292#questions/8159650

    { //third argument
      expiresIn: process.env.JWT_EXPIRES_IN
    });
};
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

  //get a token from signed data by passing in the newUser's _id (automtically generated upon creation)
  const token = signToken(newUser._id);

  /*
  {
  	"name": "Test",
  	"email": "123@test.com",
  	"password": "pass123",
  	"passwordConfirm": "pass123"
  }
  */
  //
  res.status(201).json({ // 201 Created
    status: 'success',
    token: token,
    data: {
      user: newUser,
    },
  });

  /*result:
  _id : 5ed84b10cc2af35554aac39f
  name : Test1
  email : test1@test.com
  password : $2a$12$8jHtw1TAu5BWbFry2lpKVeLyz.oSRKQu54bnNCRK/JwytD1ulbOa.
  __v : 0
  */


});


exports.login = catchAsync(async (req, res, next) => {
  //deconstruct key's value and save to variable
  const {
    email,
    password
  } = req.body;

  // 1) check if email and password exist
  if (!email || !password) {
    next(new AppError('Please provide email and password!', 400));
  }

  // 2) Check of user exists && password is correct
  const user = await User.findOne({
    email
  }).select('+password');
  // // to add password data in query result
  // const user = User.findOne('').select('+password'); //

  // In userModel.js,  use schema's prototype method "correctPassword" to compare input password and the password from database
  const correct = await user.correctPassword(password, user.password);

  //
  if (!user || !correct) {
    return next(new AppError('Incorrect email or password', 401));
  }


  console.log(user);
  /* (original password 1234)
  {
    _id: 5ed91a42e076015f68b1243e,
    name: 'Test2',
    email: 'test2@test.com',
    password: '$2a$12$1.EM74vLek7GuQibWHcoO.9dZWnyXAkrsQmZXMXYlbVxZiYoXxv3.',
    __v: 0
  }
  */

  // 3) If everything ok, send token to client
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token: token,
    data: {
      user: user,
    },
  });

});
