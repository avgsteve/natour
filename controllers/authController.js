/*jshint esversion: 6 */
/*jshint esversion: 8 */
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const {
  promisify
} = require('util');

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


// ========== SIGN UP ===========
exports.signup = catchAsync(async (req, res, next) => {
  //
  // const newUser = await User.create(req.body);
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  //get a token from signed data by passing in the newUser's _id (automtically generated upon creation)
  const token = signToken(newUser._id); //._id is automtically added by mongoose Model

  /*  ex:
  the value of property: _id from a newly created user: 5ede44f1202c03583865838d

  the generated token is:  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlZGU0NGYxMjAyYzAzNTgzODY1ODM4ZCIsImlhdCI6MTU5MTYyNDk0NiwiZXhwIjoxNTk5NDAwOTQ2fQ.gFsObPwhN8K3aoJKRvipluEgl67dIHR78FrlAaDajpA

  the decoded token is:
  {
  "id": "5ede44f1202c03583865838d",
  "iat": 1591624946,
  "exp": 1599400946
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

// ========== LOGIN ===========
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

// ========== PROTECTion for routes from accessing with tampered or invalid token ===========
exports.protect = catchAsync(async (req, res, next) => {

  // 1) Getting token from header and check if token exists
  req.requestTime = new Date().toISOString();
  console.log(req.headers);
  /* headers example:
    {
      authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlZDdjZWU1NTlkOTQwNzI1MDY2OWQ2ZSJ9.E5PwSCrEy5UIZP4L7xuJdVFT-qTJG2OyzyMZMSBQGWw',
      'user-agent': 'PostmanRuntime/7.25.0',
      'accept-encoding': 'gzip, deflate, br',
      // ...
    }
  */
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    // ex:  ['Bearer', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlZDdjZWU1NTlkOTQwNzI1MDY2OWQ2ZSJ9.E5PwSCrEy5UIZP4L7xuJdVFT-qTJG2OyzyMZMSBQGWw'][1]

  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access',
      401 //unauthorized
    ));
  }

  // 2)
  // Decoding and verififying token (and promisify jwt.verify function) with jwt.verify
  // usage:  jwt.verify(token, secretOrPublicKey, [options, callback])
  // 2-1) will return a Promise after being 'promisified'
  // 2-2) jwt.verify will throw an error if the the token has been tampered with
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(`The decoded result from \nawait promisify(jwt.verify)(token, process.env.JWT_SECRET); : \n`);
  console.log(decoded); // { id: '5ede44f1202c03583865838d', iat: 1591624946, exp: 1599400946 }

  /* how jwt.verify() works:

    #1. original payload: {
    "id": "5ed7cee559d9407250669d6e"
    }

    #2. Token generated (ref:  https://jwt.io/): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlZDdjZWU1NTlkOTQwNzI1MDY2OWQ2ZSJ9.E5PwSCrEy5UIZP4L7xuJdVFT-qTJG2OyzyMZMSBQGWw

    if Token was tampered (ex: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlZDdjZWU1NTlkOTQwNzI1MDY2OWQ2ZSJ9.E5PwSCrEy5UIZP4L7xuJdVFT-qTJG2OyzyMZMSBQGWW), will throw an error:
    {
    "status": "error",
    "error": {
        "name": "JsonWebTokenError",
        "message": "invalid signature",
        "statusCode": 500,
        "status": "error"
    },
    "message": "invalid signature",
    "stack": "JsonWebTokenError: invalid signature\n    at
  */

  // 3) Check if user still exists (in case the user is deleted after token is created)
  const freshUser = await User.findById(decoded.id); //Based on the success of decoding token, we can verify the authentication of the User data
  /*
  {
      "status": "fail",
      "error": {
          "statusCode": 401,
          "status": "fail",
          "isOperational": true
      },
      "message": "The user belonging to this token doesn't exist",
      "stack": "Error: The user belonging to this token doesn't exist\n    at D:\\Dropbox\\Udemy\\JavaScript\\complete-node-bootcamp\\4-natours\\controllers\\authController.js:186:17\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)"
  }
  */

  //To
  if (!freshUser) {
    return next(new AppError('The user belonging to this token doesn\'t exist', 401));
  }

  // 4) Check if user changed password after the token was issued by calling method:
  // (in userModel.js) userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {

  // if changedPasswordAfter() returns true
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password! Please log in again!', 401));
  }

  //if all above 4 test are passed, then the login process is cleared to move on to next function middleware
  console.log('\nLog-In process cleared! Move on to next route middleware:\n');

  req.user = freshUser; // assign to fresh user data to req.user property and make it used by next middleware function

  console.log('\n=== The req.user === :\n');
  console.log(req.user);
  /* req.user will be the result obj from the code:

  const freshUser = await User.findById(decoded.id);

  result:
  {
    _id: 5ede44f1202c03583865838d,
    name: 'Test112',
    email: 'test112@test.com',
    passwordChangedAt: 2020-04-30T00:00:00.000Z,
    __v: 0
  }
  */
  next();
});


// verify user's role based on his role property
// In authController.js,  delete(authController.protect, authController.restrictTo('admin', 'lead-guide'),
exports.restrictTo = (...roles) => {
  //the passed in ...roles will be array containing ['admin', 'lead-guide']

  return (req, res, next) => {
    // roles ['admin', 'lead-guide'] role =  'user'

    // if the passed-in roles array does not include any .role property
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403 // forbidden
      ));
    }

    next();
  };
};
