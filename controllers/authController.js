/*jshint esversion: 6 */
/*jshint esversion: 8 */
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const {
  promisify
} = require('util');
const sendEmail = require('./../utils/email');
const crypto = require('crypto');

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


const createSendToken = (user, statusCode, res) => {

  const token = signToken(user._id);

  //cookieOptions is used in res.cookie as a setting option for res.cookie which can save cookie for client
  const cookieOptions = {
    // Option: expires .  Expiry date of the cookie in GMT. If not specified or set to 0, creates a session cookie.
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000 // * 24 * 60 * 60 * 1000 => one day
    ),

    // secure: true, // via https only (switching this value with below code)
    httpOnly: true // Flags the cookie to be accessible only by the web server to preven cross site scripting attack
  };

  if (process.env.NODE_ENV === 'production') {
    // set secure option to true when in production mode
    cookieOptions.secure = true;
  }

  //res.cookie(name, value [, options Obj])
  res.cookie('jwt', token, cookieOptions
    //ref for res.cookie & CookieOptions:  https://expressjs.com/en/api.html#res.cookie
  );

  // temperarily set user.password to undefined which will not actually save it to document. Doing so , we can hide the password field from the user results
  user.password = "not to be shown";

  res.status(statusCode).json({
    status: 'success',
    token: token,
    data: {
      user: user,
    },
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
  // res.status(201).json({ // 201 Created
  //   status: 'success',
  //   token: token,
  //   data: {
  //     user: newUser,
  //   },
  // });
  // === replace above code with below: ==
  createSendToken(newUser, 201, res);

  /*result:
  _id : 5ed84b10cc2af35554aac39f
  name : Test1
  email : test1@test.com
  password : $2a$12$8jHtw1TAu5BWbFry2lpKVeLyz.oSRKQu54bnNCRK/JwytD1ulbOa.
  __v : 0
  */


});

// ========== LOGIN ===========
// (find user and then compare input raw password and hased password in DB with bcrypt in document.correctPassword() )
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
  // correctPassword() is an async function so use await here

  // if user is false or correctPassword is false, return an new Error
  if (!user || !(await user.correctPassword(password, user.password)) //
  ) {
    console.log(`\nMessage from authController: \n`);
    console.log("\x1b[31m", "User log-in has failed!\n" + "\u001b[0m");
    return next(new AppError('Incorrect email or password', 401));
  }


  console.log(`\nMessage from authController: \n`);
  console.log("User: " + "\u001b[32m" + user.name + "\u001b[0m" + " has successful logged in!\n");

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
  /*
  // const token = signToken(user._id);
  // res.status(200).json({
  //   status: 'success',
  //   token: token,
  //   data: {
  //     user: user,
  //   },
  // });
  // === replace above code with below: == */
  createSendToken(user, 200, res);


});

// ========== PROTECTion for routes from accessing with tampered or invalid token ===========
exports.protect = catchAsync(async (req, res, next) => {

  // 1) Getting token from header and check if token exists
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
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
  //
  // console.log("\nfreshUser:\n");
  // console.log(freshUser);


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

  // console.log('\n=== The req.user === :\n');
  // console.log(req.user);
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

    // console.log('\n=== The req obj in authController.restrictTo:\n');
    // console.log(req);

    // if the passed-in roles array does not include any .role property
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403 // forbidden
      ));
    }

    next();
  };
};


// ========== GENERATE TOKEN WHEN FORGETTING PASSWORD AND SEND IT VIA MAIL ===========
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) When forget password, use registered email to get user based on POSTed email
  const user = await User.findOne({
    email: req.body.email
  });
  // 1-1) if there's no result matched with query, then return an error
  if (!user) {
    return next(new AppError('There is no user with this email address.', 404));
  }

  // 2) !!key point!! Generate the random reset token with method createPasswordResetToken inherited from prototype chain in User schema.  Meanwhile in createPasswordResetToken function, in order to set time limit for this token in property: passwordResetExpires , it will use Date.now() and add 10 more minutes as expiration time!
  const resetToken = user.createPasswordResetToken();
  // await user.save({ validateBeforeSave: false });  (will save the property to database later)

  // 3) Send URL with reset token suffix to user's email //req.protocol is current http or https protocol
  const resetURL = `${req.protocol}://${req.get('host')}/api/va/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a Patch request with your newpassword and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ingore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message: message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });

  } catch (error) {
    console.log('\n\nerror log in send email:\n');
    console.log(error);
    // if there's error returned from sendEmail function, then set current user's password-reset related property to undefined (clear out the generated token in case being abused or stolen)
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    //update the document with the updated value in certain fields in data base via .save method from document instance ()
    await user.save({
      validateBeforeSave: false
    });

    return next(new AppError('There was an error sending the email. Try again later', 500));
  }

  // save all new value created by the this middlware function and User' model prototype function such as userSchema.methods.createPasswordResetToken in userModel.js
  await user.save({
    validateBeforeSave: false
  });

  //the new value in related document fields in database after calling .save function will be like:
  /*
    passwordResetExpires:  2020-06-12T06:28:56.118+00:00,
    passwordResetToken:  b63774eb04a10259c7d674980c591e097bbee641464329732ec7148868219914
  */

});


// ========== RESET PASSWORD after calling createPasswordResetToken in middleware:forgotPassword ===========
// as the middleware for the route:  router.patch('/resetPassword/:token', authController.resetPassword);
exports.resetPassword = catchAsync(async (req, res, next) => {

  // 1-1) Get the token from the URL for resetting password

  // // HASH plain token with cryto and save it to variable hashedToke
  // // which will be used to find the user has the same hashed token value in field: .passwordResetToken
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  //router.patch('/resetPassword/:token', authController.resetPassword);

  // // //so the received value via param.token will be the URL suffix generated by schema method createPasswordResetToken()
  // // // ( via crypto.randomBytes(32).toString('hex') ) so it needs to be hashed with same algorithm as the .passwordResetToken

  // // 1-2 find user with hashedToken,
  const user = await User.findOne({
    passwordResetToken: hashedToken, // data must have matched hashed token

    // there will be NO MATCHED RESULT even there's a result has matched hashedToken value if the value of time in passwordResetExpires field is not greater than Date.now(); as the value for passwordResetExpires property is create beforehand with extra 10 minutes added to the time the hoken was being created.
    passwordResetExpires: {
      $gt: Date.now() // ex: the value of passwordResetExpires was 1591941874576 (2020/06/12 14:00) and 10 more minutes will be added to the value then will be 1591942529921 (1000*60*10 added)
    }
  });

  // 2) If the above search condition is not met, will let to zero result return to variable "user"
  // // if not exists (no matched results)
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // 2-1) If all query are successfully completed, then save the current user's properties with data passed-in from PATCH request
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save(); //no need to set validator to false

  // 3) Update the changedPasswordAt property for the user
  // user.passwordChangedAt = Date.now();

  /* !! passwordChangedAt property's new Date value will be created by pre. middleware function in userModel.js
  ex:  //ex: passwordChangedAt:  2020-06-12T05:30:12.163+00:00

  userSchema.pre('save', function(next) {

    if (!this.isModified('password' || this.isNew)) {
      return next();
    }

    // deduct 1 second from Date.now() to make sure the recored time of new token is always before new password is created
    this.passwordChangedAt = Date.now() - 1000;
    next();


  });

*/
  // 4) Log the user in, send JWT
  /*
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token: token,
  });
  // === replace above code with below: == */
  createSendToken(user, 200, res);



});

//will received document and ._id property from req.user passed-in from protect middlware
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection (.select password field and use the password for verification)
  const user = await User.findById(req.user.id).select('+password'); //takes 1.27 second

  /* // log req.user.id
    console.log(`\nreq.user.id : ${req.user.id}\n`);
    console.log(`\nreq.user._id : ${req.user._id}\n`);
    console.log(`\nreq : ${req.body}\n`);
    console.log(req.body);
    */
  // const user = await User.findOne(req.user._id).select('+password'); // takes 22 seconds

  // const user = await User.findOne({
  //   _id: req.user._id
  // }).select('+password'); // takes 23 seconds


  // 2) Check if the password from POSTed req is correct (matched with the password currently stored in database)
  // Via bcrypt.compare() in schema's user.correctPassword() , will get boolean value
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is incorrect', 401));
  }

  // 3) If so, updatePassword
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // (Also, the .save() function will trigger the validator in schema to see if the value in .password field matches the value in .passwordConfirm field, if not matched , will throw an validation error)

  await user.save(); // ref: https://mongoosejs.com/docs/api.html#model_Model-save

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);

});

// IncomingMessage {
//   _readableState: ReadableState {
//     objectMode: false,
//     highWaterMark: 16384,
//     buffer: BufferList { head: null, tail: null, length: 0 },
//     length: 0,
//     pipes: null,
//     pipesCount: 0,
//     flowing: true,
//     ended: true,
//     endEmitted: true,
//     reading: false,
//     sync: false,
//     needReadable: false,
//     emittedReadable: false,
//     readableListening: false,
//     resumeScheduled: false,
//     emitClose: true,
//     autoDestroy: false,
//     destroyed: false,
//     defaultEncoding: 'utf8',
//     awaitDrain: 0,
//     readingMore: false,
//     decoder: null,
//     encoding: null,
//     [Symbol(kPaused)]: false
//   },
//   readable: false,
//   _events: [Object: null prototype] {
//     end: [Function: resetHeadersTimeoutOnReqEnd]
//   },
//   _eventsCount: 1,
//   _maxListeners: undefined,
//   socket: Socket {
//     connecting: false,
//     _hadError: false,
//     _parent: null,
//     _host: null,
//     _readableState: ReadableState {
//       objectMode: false,
//       highWaterMark: 16384,
//       buffer: BufferList { head: null, tail: null, length: 0 },
//       length: 0,
//       pipes: null,
//       pipesCount: 0,
//       flowing: true,
//       ended: false,
//       endEmitted: false,
//       reading: true,
//       sync: false,
//       needReadable: true,
//       emittedReadable: false,
//       readableListening: false,
//       resumeScheduled: false,
//       emitClose: false,
//       autoDestroy: false,
//       destroyed: false,
//       defaultEncoding: 'utf8',
//       awaitDrain: 0,
//       readingMore: false,
//       decoder: null,
//       encoding: null,
//       [Symbol(kPaused)]: false
//     },
//     readable: true,
//     _events: [Object: null prototype] {
//       end: [Array],
//       timeout: [Function: socketOnTimeout],
//       data: [Function: bound socketOnData],
//       error: [Array],
//       close: [Array],
//       drain: [Function: bound socketOnDrain],
//       resume: [Function: onSocketResume],
//       pause: [Function: onSocketPause]
//     },
//     _eventsCount: 8,
//     _maxListeners: undefined,
//     _writableState: WritableState {
//       objectMode: false,
//       highWaterMark: 16384,
//       finalCalled: false,
//       needDrain: false,
//       ending: false,
//       ended: false,
//       finished: false,
//       destroyed: false,
//       decodeStrings: false,
//       defaultEncoding: 'utf8',
//       length: 0,
//       writing: false,
//       corked: 0,
//       sync: true,
//       bufferProcessing: false,
//       onwrite: [Function: bound onwrite],
//       writecb: null,
//       writelen: 0,
//       afterWriteTickInfo: null,
//       bufferedRequest: null,
//       lastBufferedRequest: null,
//       pendingcb: 0,
//       prefinished: false,
//       errorEmitted: false,
//       emitClose: false,
//       autoDestroy: false,
//       bufferedRequestCount: 0,
//       corkedRequestsFree: [Object]
//     },
//     writable: true,
//     allowHalfOpen: true,
//     _sockname: null,
//     _pendingData: null,
//     _pendingEncoding: '',
//     server: Server {
//       insecureHTTPParser: undefined,
//       _events: [Object: null prototype],
//       _eventsCount: 2,
//       _maxListeners: undefined,
//       _connections: 1,
//       _handle: [TCP],
//       _usingWorkers: false,
//       _workers: [],
//       _unref: false,
//       allowHalfOpen: true,
//       pauseOnConnect: false,
//       httpAllowHalfOpen: false,
//       timeout: 120000,
//       keepAliveTimeout: 5000,
//       maxHeadersCount: null,
//       headersTimeout: 40000,
//       _connectionKey: '6::::3000',
//       [Symbol(IncomingMessage)]: [Function: IncomingMessage],
//       [Symbol(ServerResponse)]: [Function: ServerResponse],
//       [Symbol(kCapture)]: false,
//       [Symbol(asyncId)]: 11
//     },
//     _server: Server {
//       insecureHTTPParser: undefined,
//       _events: [Object: null prototype],
//       _eventsCount: 2,
//       _maxListeners: undefined,
//       _connections: 1,
//       _handle: [TCP],
//       _usingWorkers: false,
//       _workers: [],
//       _unref: false,
//       allowHalfOpen: true,
//       pauseOnConnect: false,
//       httpAllowHalfOpen: false,
//       timeout: 120000,
//       keepAliveTimeout: 5000,
//       maxHeadersCount: null,
//       headersTimeout: 40000,
//       _connectionKey: '6::::3000',
//       [Symbol(IncomingMessage)]: [Function: IncomingMessage],
//       [Symbol(ServerResponse)]: [Function: ServerResponse],
//       [Symbol(kCapture)]: false,
//       [Symbol(asyncId)]: 11
//     },
//     timeout: 120000,
//     parser: HTTPParser {
//       '0': [Function: parserOnHeaders],
//       '1': [Function: parserOnHeadersComplete],
//       '2': [Function: parserOnBody],
//       '3': [Function: parserOnMessageComplete],
//       '4': [Function: bound onParserExecute],
//       _headers: [],
//       _url: '',
//       socket: [Circular],
//       incoming: [Circular],
//       outgoing: null,
//       maxHeaderPairs: 2000,
//       _consumed: true,
//       onIncoming: [Function: bound parserOnIncoming],
//       parsingHeadersStart: 1591970312557
//     },
//     on: [Function: socketListenerWrap],
//     addListener: [Function: socketListenerWrap],
//     prependListener: [Function: socketListenerWrap],
//     _paused: false,
//     _httpMessage: ServerResponse {
//       _events: [Object: null prototype],
//       _eventsCount: 2,
//       _maxListeners: undefined,
//       outputData: [],
//       outputSize: 0,
//       writable: true,
//       _last: false,
//       chunkedEncoding: false,
//       shouldKeepAlive: true,
//       useChunkedEncodingByDefault: true,
//       sendDate: true,
//       _removedConnection: false,
//       _removedContLen: false,
//       _removedTE: false,
//       _contentLength: null,
//       _hasBody: true,
//       _trailer: '',
//       finished: false,
//       _headerSent: false,
//       socket: [Circular],
//       connection: [Circular],
//       _header: null,
//       _onPendingData: [Function: bound updateOutgoingData],
//       _sent100: false,
//       _expect_continue: false,
//       req: [Circular],
//       locals: [Object: null prototype] {},
//       _startAt: undefined,
//       _startTime: undefined,
//       writeHead: [Function: writeHead],
//       __onFinished: [Function],
//       [Symbol(kCapture)]: false,
//       [Symbol(kNeedDrain)]: false,
//       [Symbol(corked)]: 0,
//       [Symbol(kOutHeaders)]: [Object: null prototype]
//     },
//     _peername: { address: '::ffff:127.0.0.1', family: 'IPv6', port: 5572 },
//     [Symbol(asyncId)]: 215,
//     [Symbol(kHandle)]: TCP {
//       reading: true,
//       onconnection: null,
//       _consumed: true,
//       [Symbol(owner)]: [Circular]
//     },
//     [Symbol(lastWriteQueueSize)]: 0,
//     [Symbol(timeout)]: Timeout {
//       _idleTimeout: 120000,
//       _idlePrev: [TimersList],
//       _idleNext: [TimersList],
//       _idleStart: 13708,
//       _onTimeout: [Function: bound ],
//       _timerArgs: undefined,
//       _repeat: null,
//       _destroyed: false,
//       [Symbol(refed)]: false,
//       [Symbol(asyncId)]: 216,
//       [Symbol(triggerId)]: 215
//     },
//     [Symbol(kBuffer)]: null,
//     [Symbol(kBufferCb)]: null,
//     [Symbol(kBufferGen)]: null,
//     [Symbol(kCapture)]: false,
//     [Symbol(kBytesRead)]: 0,
//     [Symbol(kBytesWritten)]: 0
//   },
//   connection: Socket {
//     connecting: false,
//     _hadError: false,
//     _parent: null,
//     _host: null,
//     _readableState: ReadableState {
//       objectMode: false,
//       highWaterMark: 16384,
//       buffer: BufferList { head: null, tail: null, length: 0 },
//       length: 0,
//       pipes: null,
//       pipesCount: 0,
//       flowing: true,
//       ended: false,
//       endEmitted: false,
//       reading: true,
//       sync: false,
//       needReadable: true,
//       emittedReadable: false,
//       readableListening: false,
//       resumeScheduled: false,
//       emitClose: false,
//       autoDestroy: false,
//       destroyed: false,
//       defaultEncoding: 'utf8',
//       awaitDrain: 0,
//       readingMore: false,
//       decoder: null,
//       encoding: null,
//       [Symbol(kPaused)]: false
//     },
//     readable: true,
//     _events: [Object: null prototype] {
//       end: [Array],
//       timeout: [Function: socketOnTimeout],
//       data: [Function: bound socketOnData],
//       error: [Array],
//       close: [Array],
//       drain: [Function: bound socketOnDrain],
//       resume: [Function: onSocketResume],
//       pause: [Function: onSocketPause]
//     },
//     _eventsCount: 8,
//     _maxListeners: undefined,
//     _writableState: WritableState {
//       objectMode: false,
//       highWaterMark: 16384,
//       finalCalled: false,
//       needDrain: false,
//       ending: false,
//       ended: false,
//       finished: false,
//       destroyed: false,
//       decodeStrings: false,
//       defaultEncoding: 'utf8',
//       length: 0,
//       writing: false,
//       corked: 0,
//       sync: true,
//       bufferProcessing: false,
//       onwrite: [Function: bound onwrite],
//       writecb: null,
//       writelen: 0,
//       afterWriteTickInfo: null,
//       bufferedRequest: null,
//       lastBufferedRequest: null,
//       pendingcb: 0,
//       prefinished: false,
//       errorEmitted: false,
//       emitClose: false,
//       autoDestroy: false,
//       bufferedRequestCount: 0,
//       corkedRequestsFree: [Object]
//     },
//     writable: true,
//     allowHalfOpen: true,
//     _sockname: null,
//     _pendingData: null,
//     _pendingEncoding: '',
//     server: Server {
//       insecureHTTPParser: undefined,
//       _events: [Object: null prototype],
//       _eventsCount: 2,
//       _maxListeners: undefined,
//       _connections: 1,
//       _handle: [TCP],
//       _usingWorkers: false,
//       _workers: [],
//       _unref: false,
//       allowHalfOpen: true,
//       pauseOnConnect: false,
//       httpAllowHalfOpen: false,
//       timeout: 120000,
//       keepAliveTimeout: 5000,
//       maxHeadersCount: null,
//       headersTimeout: 40000,
//       _connectionKey: '6::::3000',
//       [Symbol(IncomingMessage)]: [Function: IncomingMessage],
//       [Symbol(ServerResponse)]: [Function: ServerResponse],
//       [Symbol(kCapture)]: false,
//       [Symbol(asyncId)]: 11
//     },
//     _server: Server {
//       insecureHTTPParser: undefined,
//       _events: [Object: null prototype],
//       _eventsCount: 2,
//       _maxListeners: undefined,
//       _connections: 1,
//       _handle: [TCP],
//       _usingWorkers: false,
//       _workers: [],
//       _unref: false,
//       allowHalfOpen: true,
//       pauseOnConnect: false,
//       httpAllowHalfOpen: false,
//       timeout: 120000,
//       keepAliveTimeout: 5000,
//       maxHeadersCount: null,
//       headersTimeout: 40000,
//       _connectionKey: '6::::3000',
//       [Symbol(IncomingMessage)]: [Function: IncomingMessage],
//       [Symbol(ServerResponse)]: [Function: ServerResponse],
//       [Symbol(kCapture)]: false,
//       [Symbol(asyncId)]: 11
//     },
//     timeout: 120000,
//     parser: HTTPParser {
//       '0': [Function: parserOnHeaders],
//       '1': [Function: parserOnHeadersComplete],
//       '2': [Function: parserOnBody],
//       '3': [Function: parserOnMessageComplete],
//       '4': [Function: bound onParserExecute],
//       _headers: [],
//       _url: '',
//       socket: [Circular],
//       incoming: [Circular],
//       outgoing: null,
//       maxHeaderPairs: 2000,
//       _consumed: true,
//       onIncoming: [Function: bound parserOnIncoming],
//       parsingHeadersStart: 1591970312557
//     },
//     on: [Function: socketListenerWrap],
//     addListener: [Function: socketListenerWrap],
//     prependListener: [Function: socketListenerWrap],
//     _paused: false,
//     _httpMessage: ServerResponse {
//       _events: [Object: null prototype],
//       _eventsCount: 2,
//       _maxListeners: undefined,
//       outputData: [],
//       outputSize: 0,
//       writable: true,
//       _last: false,
//       chunkedEncoding: false,
//       shouldKeepAlive: true,
//       useChunkedEncodingByDefault: true,
//       sendDate: true,
//       _removedConnection: false,
//       _removedContLen: false,
//       _removedTE: false,
//       _contentLength: null,
//       _hasBody: true,
//       _trailer: '',
//       finished: false,
//       _headerSent: false,
//       socket: [Circular],
//       connection: [Circular],
//       _header: null,
//       _onPendingData: [Function: bound updateOutgoingData],
//       _sent100: false,
//       _expect_continue: false,
//       req: [Circular],
//       locals: [Object: null prototype] {},
//       _startAt: undefined,
//       _startTime: undefined,
//       writeHead: [Function: writeHead],
//       __onFinished: [Function],
//       [Symbol(kCapture)]: false,
//       [Symbol(kNeedDrain)]: false,
//       [Symbol(corked)]: 0,
//       [Symbol(kOutHeaders)]: [Object: null prototype]
//     },
//     _peername: { address: '::ffff:127.0.0.1', family: 'IPv6', port: 5572 },
//     [Symbol(asyncId)]: 215,
//     [Symbol(kHandle)]: TCP {
//       reading: true,
//       onconnection: null,
//       _consumed: true,
//       [Symbol(owner)]: [Circular]
//     },
//     [Symbol(lastWriteQueueSize)]: 0,
//     [Symbol(timeout)]: Timeout {
//       _idleTimeout: 120000,
//       _idlePrev: [TimersList],
//       _idleNext: [TimersList],
//       _idleStart: 13708,
//       _onTimeout: [Function: bound ],
//       _timerArgs: undefined,
//       _repeat: null,
//       _destroyed: false,
//       [Symbol(refed)]: false,
//       [Symbol(asyncId)]: 216,
//       [Symbol(triggerId)]: 215
//     },
//     [Symbol(kBuffer)]: null,
//     [Symbol(kBufferCb)]: null,
//     [Symbol(kBufferGen)]: null,
//     [Symbol(kCapture)]: false,
//     [Symbol(kBytesRead)]: 0,
//     [Symbol(kBytesWritten)]: 0
//   },
//   httpVersionMajor: 1,
//   httpVersionMinor: 1,
//   httpVersion: '1.1',
//   complete: true,
//   headers: {
//     authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlZTM2MzM2N2JiOGM3NjU0NDI4NjJjMyIsImlhdCI6MTU5MTk3MDI4NSwiZXhwIjoxNTk5NzQ2Mjg1fQ.ZXS102-Mq6M1vyhXeOncK8LY7ZgZ5qkDw6a0VrBO4wo',
//     'content-type': 'application/json',
//     'user-agent': 'PostmanRuntime/7.25.0',
//     accept: '*/*',
//     'postman-token': '39f3d567-79a2-4c40-bea9-62a142a259bc',
//     host: '127.0.0.1:3000',
//     'accept-encoding': 'gzip, deflate, br',
//     connection: 'keep-alive',
//     'content-length': '98'
//   },
//   rawHeaders: [
//     'Authorization',
//     'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlZTM2MzM2N2JiOGM3NjU0NDI4NjJjMyIsImlhdCI6MTU5MTk3MDI4NSwiZXhwIjoxNTk5NzQ2Mjg1fQ.ZXS102-Mq6M1vyhXeOncK8LY7ZgZ5qkDw6a0VrBO4wo',
//     'Content-Type',
//     'application/json',
//     'User-Agent',
//     'PostmanRuntime/7.25.0',
//     'Accept',
//     '*/*',
//     'Postman-Token',
//     '39f3d567-79a2-4c40-bea9-62a142a259bc',
//     'Host',
//     '127.0.0.1:3000',
//     'Accept-Encoding',
//     'gzip, deflate, br',
//     'Connection',
//     'keep-alive',
//     'Content-Length',
//     '98'
//   ],
//   trailers: {},
//   rawTrailers: [],
//   aborted: false,
//   upgrade: false,
//   url: '/updateMyPassword/',
//   method: 'PATCH',
//   statusCode: null,
//   statusMessage: null,
//   client: Socket {
//     connecting: false,
//     _hadError: false,
//     _parent: null,
//     _host: null,
//     _readableState: ReadableState {
//       objectMode: false,
//       highWaterMark: 16384,
//       buffer: BufferList { head: null, tail: null, length: 0 },
//       length: 0,
//       pipes: null,
//       pipesCount: 0,
//       flowing: true,
//       ended: false,
//       endEmitted: false,
//       reading: true,
//       sync: false,
//       needReadable: true,
//       emittedReadable: false,
//       readableListening: false,
//       resumeScheduled: false,
//       emitClose: false,
//       autoDestroy: false,
//       destroyed: false,
//       defaultEncoding: 'utf8',
//       awaitDrain: 0,
//       readingMore: false,
//       decoder: null,
//       encoding: null,
//       [Symbol(kPaused)]: false
//     },
//     readable: true,
//     _events: [Object: null prototype] {
//       end: [Array],
//       timeout: [Function: socketOnTimeout],
//       data: [Function: bound socketOnData],
//       error: [Array],
//       close: [Array],
//       drain: [Function: bound socketOnDrain],
//       resume: [Function: onSocketResume],
//       pause: [Function: onSocketPause]
//     },
//     _eventsCount: 8,
//     _maxListeners: undefined,
//     _writableState: WritableState {
//       objectMode: false,
//       highWaterMark: 16384,
//       finalCalled: false,
//       needDrain: false,
//       ending: false,
//       ended: false,
//       finished: false,
//       destroyed: false,
//       decodeStrings: false,
//       defaultEncoding: 'utf8',
//       length: 0,
//       writing: false,
//       corked: 0,
//       sync: true,
//       bufferProcessing: false,
//       onwrite: [Function: bound onwrite],
//       writecb: null,
//       writelen: 0,
//       afterWriteTickInfo: null,
//       bufferedRequest: null,
//       lastBufferedRequest: null,
//       pendingcb: 0,
//       prefinished: false,
//       errorEmitted: false,
//       emitClose: false,
//       autoDestroy: false,
//       bufferedRequestCount: 0,
//       corkedRequestsFree: [Object]
//     },
//     writable: true,
//     allowHalfOpen: true,
//     _sockname: null,
//     _pendingData: null,
//     _pendingEncoding: '',
//     server: Server {
//       insecureHTTPParser: undefined,
//       _events: [Object: null prototype],
//       _eventsCount: 2,
//       _maxListeners: undefined,
//       _connections: 1,
//       _handle: [TCP],
//       _usingWorkers: false,
//       _workers: [],
//       _unref: false,
//       allowHalfOpen: true,
//       pauseOnConnect: false,
//       httpAllowHalfOpen: false,
//       timeout: 120000,
//       keepAliveTimeout: 5000,
//       maxHeadersCount: null,
//       headersTimeout: 40000,
//       _connectionKey: '6::::3000',
//       [Symbol(IncomingMessage)]: [Function: IncomingMessage],
//       [Symbol(ServerResponse)]: [Function: ServerResponse],
//       [Symbol(kCapture)]: false,
//       [Symbol(asyncId)]: 11
//     },
//     _server: Server {
//       insecureHTTPParser: undefined,
//       _events: [Object: null prototype],
//       _eventsCount: 2,
//       _maxListeners: undefined,
//       _connections: 1,
//       _handle: [TCP],
//       _usingWorkers: false,
//       _workers: [],
//       _unref: false,
//       allowHalfOpen: true,
//       pauseOnConnect: false,
//       httpAllowHalfOpen: false,
//       timeout: 120000,
//       keepAliveTimeout: 5000,
//       maxHeadersCount: null,
//       headersTimeout: 40000,
//       _connectionKey: '6::::3000',
//       [Symbol(IncomingMessage)]: [Function: IncomingMessage],
//       [Symbol(ServerResponse)]: [Function: ServerResponse],
//       [Symbol(kCapture)]: false,
//       [Symbol(asyncId)]: 11
//     },
//     timeout: 120000,
//     parser: HTTPParser {
//       '0': [Function: parserOnHeaders],
//       '1': [Function: parserOnHeadersComplete],
//       '2': [Function: parserOnBody],
//       '3': [Function: parserOnMessageComplete],
//       '4': [Function: bound onParserExecute],
//       _headers: [],
//       _url: '',
//       socket: [Circular],
//       incoming: [Circular],
//       outgoing: null,
//       maxHeaderPairs: 2000,
//       _consumed: true,
//       onIncoming: [Function: bound parserOnIncoming],
//       parsingHeadersStart: 1591970312557
//     },
//     on: [Function: socketListenerWrap],
//     addListener: [Function: socketListenerWrap],
//     prependListener: [Function: socketListenerWrap],
//     _paused: false,
//     _httpMessage: ServerResponse {
//       _events: [Object: null prototype],
//       _eventsCount: 2,
//       _maxListeners: undefined,
//       outputData: [],
//       outputSize: 0,
//       writable: true,
//       _last: false,
//       chunkedEncoding: false,
//       shouldKeepAlive: true,
//       useChunkedEncodingByDefault: true,
//       sendDate: true,
//       _removedConnection: false,
//       _removedContLen: false,
//       _removedTE: false,
//       _contentLength: null,
//       _hasBody: true,
//       _trailer: '',
//       finished: false,
//       _headerSent: false,
//       socket: [Circular],
//       connection: [Circular],
//       _header: null,
//       _onPendingData: [Function: bound updateOutgoingData],
//       _sent100: false,
//       _expect_continue: false,
//       req: [Circular],
//       locals: [Object: null prototype] {},
//       _startAt: undefined,
//       _startTime: undefined,
//       writeHead: [Function: writeHead],
//       __onFinished: [Function],
//       [Symbol(kCapture)]: false,
//       [Symbol(kNeedDrain)]: false,
//       [Symbol(corked)]: 0,
//       [Symbol(kOutHeaders)]: [Object: null prototype]
//     },
//     _peername: { address: '::ffff:127.0.0.1', family: 'IPv6', port: 5572 },
//     [Symbol(asyncId)]: 215,
//     [Symbol(kHandle)]: TCP {
//       reading: true,
//       onconnection: null,
//       _consumed: true,
//       [Symbol(owner)]: [Circular]
//     },
//     [Symbol(lastWriteQueueSize)]: 0,
//     [Symbol(timeout)]: Timeout {
//       _idleTimeout: 120000,
//       _idlePrev: [TimersList],
//       _idleNext: [TimersList],
//       _idleStart: 13708,
//       _onTimeout: [Function: bound ],
//       _timerArgs: undefined,
//       _repeat: null,
//       _destroyed: false,
//       [Symbol(refed)]: false,
//       [Symbol(asyncId)]: 216,
//       [Symbol(triggerId)]: 215
//     },
//     [Symbol(kBuffer)]: null,
//     [Symbol(kBufferCb)]: null,
//     [Symbol(kBufferGen)]: null,
//     [Symbol(kCapture)]: false,
//     [Symbol(kBytesRead)]: 0,
//     [Symbol(kBytesWritten)]: 0
//   },
//   _consuming: true,
//   _dumped: false,
//   next: [Function: next],
//   baseUrl: '/api/v1/users',
//   originalUrl: '/api/v1/users/updateMyPassword/',
//   _parsedUrl: Url {
//     protocol: null,
//     slashes: null,
//     auth: null,
//     host: null,
//     port: null,
//     hostname: null,
//     hash: null,
//     search: null,
//     query: null,
//     pathname: '/updateMyPassword/',
//     path: '/updateMyPassword/',
//     href: '/updateMyPassword/',
//     _raw: '/updateMyPassword/'
//   },
//   params: {},
//   query: {},
//   res: ServerResponse {
//     _events: [Object: null prototype] {
//       finish: [Array],
//       end: [Function: onevent]
//     },
//     _eventsCount: 2,
//     _maxListeners: undefined,
//     outputData: [],
//     outputSize: 0,
//     writable: true,
//     _last: false,
//     chunkedEncoding: false,
//     shouldKeepAlive: true,
//     useChunkedEncodingByDefault: true,
//     sendDate: true,
//     _removedConnection: false,
//     _removedContLen: false,
//     _removedTE: false,
//     _contentLength: null,
//     _hasBody: true,
//     _trailer: '',
//     finished: false,
//     _headerSent: false,
//     socket: Socket {
//       connecting: false,
//       _hadError: false,
//       _parent: null,
//       _host: null,
//       _readableState: [ReadableState],
//       readable: true,
//       _events: [Object: null prototype],
//       _eventsCount: 8,
//       _maxListeners: undefined,
//       _writableState: [WritableState],
//       writable: true,
//       allowHalfOpen: true,
//       _sockname: null,
//       _pendingData: null,
//       _pendingEncoding: '',
//       server: [Server],
//       _server: [Server],
//       timeout: 120000,
//       parser: [HTTPParser],
//       on: [Function: socketListenerWrap],
//       addListener: [Function: socketListenerWrap],
//       prependListener: [Function: socketListenerWrap],
//       _paused: false,
//       _httpMessage: [Circular],
//       _peername: [Object],
//       [Symbol(asyncId)]: 215,
//       [Symbol(kHandle)]: [TCP],
//       [Symbol(lastWriteQueueSize)]: 0,
//       [Symbol(timeout)]: Timeout {
//         _idleTimeout: 120000,
//         _idlePrev: [TimersList],
//         _idleNext: [TimersList],
//         _idleStart: 13708,
//         _onTimeout: [Function: bound ],
//         _timerArgs: undefined,
//         _repeat: null,
//         _destroyed: false,
//         [Symbol(refed)]: false,
//         [Symbol(asyncId)]: 216,
//         [Symbol(triggerId)]: 215
//       },
//       [Symbol(kBuffer)]: null,
//       [Symbol(kBufferCb)]: null,
//       [Symbol(kBufferGen)]: null,
//       [Symbol(kCapture)]: false,
//       [Symbol(kBytesRead)]: 0,
//       [Symbol(kBytesWritten)]: 0
//     },
//     connection: Socket {
//       connecting: false,
//       _hadError: false,
//       _parent: null,
//       _host: null,
//       _readableState: [ReadableState],
//       readable: true,
//       _events: [Object: null prototype],
//       _eventsCount: 8,
//       _maxListeners: undefined,
//       _writableState: [WritableState],
//       writable: true,
//       allowHalfOpen: true,
//       _sockname: null,
//       _pendingData: null,
//       _pendingEncoding: '',
//       server: [Server],
//       _server: [Server],
//       timeout: 120000,
//       parser: [HTTPParser],
//       on: [Function: socketListenerWrap],
//       addListener: [Function: socketListenerWrap],
//       prependListener: [Function: socketListenerWrap],
//       _paused: false,
//       _httpMessage: [Circular],
//       _peername: [Object],
//       [Symbol(asyncId)]: 215,
//       [Symbol(kHandle)]: [TCP],
//       [Symbol(lastWriteQueueSize)]: 0,
//       [Symbol(timeout)]: Timeout {
//         _idleTimeout: 120000,
//         _idlePrev: [TimersList],
//         _idleNext: [TimersList],
//         _idleStart: 13708,
//         _onTimeout: [Function: bound ],
//         _timerArgs: undefined,
//         _repeat: null,
//         _destroyed: false,
//         [Symbol(refed)]: false,
//         [Symbol(asyncId)]: 216,
//         [Symbol(triggerId)]: 215
//       },
//       [Symbol(kBuffer)]: null,
//       [Symbol(kBufferCb)]: null,
//       [Symbol(kBufferGen)]: null,
//       [Symbol(kCapture)]: false,
//       [Symbol(kBytesRead)]: 0,
//       [Symbol(kBytesWritten)]: 0
//     },
//     _header: null,
//     _onPendingData: [Function: bound updateOutgoingData],
//     _sent100: false,
//     _expect_continue: false,
//     req: [Circular],
//     locals: [Object: null prototype] {},
//     _startAt: undefined,
//     _startTime: undefined,
//     writeHead: [Function: writeHead],
//     __onFinished: [Function: listener] { queue: [Array] },
//     [Symbol(kCapture)]: false,
//     [Symbol(kNeedDrain)]: false,
//     [Symbol(corked)]: 0,
//     [Symbol(kOutHeaders)]: [Object: null prototype] { 'x-powered-by': [Array] }
//   },
//   _startAt: [ 129780, 827209300 ],
//   _startTime: 2020-06-12T13:58:32.561Z,
//   _remoteAddress: '::ffff:127.0.0.1',
//   body: {
//     passwordCurrent: 'admin003',
//     password: 'admin001',
//     passwordConfirm: 'admin001'
//   },
//   _body: true,
//   length: undefined,
//   requestTime: '2020-06-12T13:58:32.573Z',
//   route: Route {
//     path: '/updateMyPassword',
//     stack: [ [Layer], [Layer] ],
//     methods: { patch: true }
//   },
//   user: {
//     role: 'admin',
//     _id: 5ee363367bb8c765442862c3,
//     name: 'admin001',
//     email: 'admin001@test.com',
//     __v: 0,
//     passwordChangedAt: 2020-06-12T13:58:04.108Z
//   },
//   [Symbol(kCapture)]: false
// }
