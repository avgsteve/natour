/*jshint esversion: 6 */
/*jshint esversion: 8 */
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const {
  promisify
} = require('util');
const EmailWithNodeMailer = require('./../utils/email');
const crypto = require('crypto');
const timeStamp = require('./../utils/timeStamp');
const timestamp = timeStamp.getTimeStamp(); // use console.log(`\nCurrent time : ${timestamp} (UCT+8)`);




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


// Sign a token and set cookie for user
const createSendToken = (user, statusCode, req, res) => {

  //
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    // res.cookie(name, value [, options Obj])
    // ref: http://expressjs.com/en/5x/api.html#res.cookie

    expires: new Date(
      // Option: expires . Set expiry date of the cookie in GMT. If not specified or set to 0, creates a session cookie.

      //conver the value in .JWT_COOKIE_EXPIRES_IN to day (* 24 * 60 * 60 * 1000)
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000 // * 24 * 60 * 60 * 1000 => one day
    ),

    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    // secure: If true, this will mark the cookie to be used with HTTPS only.

    // req.secure: A Boolean property that is true if a TLS connection is established. Equivalent to the following: req.protocol === 'https'  . ref:  http://expressjs.com/en/5x/api.html#req.secure

    // req.headers: ( ref to Notes 3) )https://developer.mozilla.org/en-US/docs/Glossary/Request_header

    /*Notes:
    1) https://stackoverflow.com/questions/35564896/req-secure-in-node-alwys-false

    Solution: req.get('x-forwarded-proto')

    2) https://stackoverflow.com/questions/40876599/express-js-force-https-ssl-redirect-error-too-many-redirects

    Solution: req.get('X-Forwarded-Proto')=='https'

    3) Heroku headers
    https://devcenter.heroku.com/articles/http-routing#heroku-headers

    All headers are considered to be case-insensitive, as per HTTP Specification. The X-Forwarded-For, X-Forwarded-By, X-Forwarded-Proto, and X-Forwarded-Host headers are not trusted for security reasons, because it is not possible to know the order in which already existing fields were added (as per Forwarded HTTP Extension).

    X-Forwarded-Proto: the originating protocol of the HTTP request (example: https)

    */

    httpOnly: true, // Flags the cookie to be accessible only by the web server to preven cross site scripting attack

  });
  //ref for res.cookie & CookieOptions:  https://expressjs.com/en/api.html#res.cookie

  // ==== temperarily set user.password to undefined which will not actually save it to document. Doing so , we can hide the password field from the user results
  user.password = "not to be shown :";

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

  //
  const url = `${req.protocol}://${req.get('host')}/me`;

  //
  await new EmailWithNodeMailer(newUser, url).sendWelcome();

  // res.status(201).json({ // 201 Created
  //   status: 'success',
  //   token: token,
  //   data: {
  //     user: newUser,
  //   },
  // });
  // === replace above code with below: ==
  createSendToken(newUser, 201, req, res);

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

  // if LOG IN IS SUCCESSFUL
  console.log(`\nMessage from authController: \n`);
  console.log("\u001b[32m", "User log-in is successful!\n" + "\u001b[0m");
  console.log("User: " + "\x1b[35m" + user.name + "\u001b[0m" + " has successful logged in!\n");

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
  createSendToken(user, 200, req, res);


});


// ========== LOG OUT ===========
// By sending the token expires immediately in a very short period of time
exports.logout = catchAsync(async (req, res, next) => {

  // The cookie "loggedOut" will trigger the false value returned from function "isLoggedIn".
  // Also, this cookie won't appear in browser anymore next time the page is reloaded
  //  as the cookie has expired in 0.5 second
  res.cookie('jwt', 'loggedOut', {
    expires: new Date(Date.now() + 100),
    httpOnly: true,
  });

  //
  res.status(200).json({
    status: 'success',
    responseMessage: 'token for logging out user has been sent!',
  });

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

  // first check if there's authorization property and also the value starts with initial "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    // ex:  ['Bearer', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlZDdjZWU1NTlkOTQwNzI1MDY2OWQ2ZSJ9.E5PwSCrEy5UIZP4L7xuJdVFT-qTJG2OyzyMZMSBQGWw'][1]
  }
  // check if there's jwt token (json web token) in cookie
  else if (req.cookies.jwt) {
    // then show what's in the cookies
    token = req.cookies.jwt;
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

  res.locals.user = freshUser; // .locals can let .pug templates use the locals properties as variables and read values

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


// ========== Check if use is logged in ===========
// Will get cookie for token & query a user document then save it to res.locals.user as locals variable for .pug files
exports.isLoggedIn = async (req, res, next) => {

  //ref:  https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/learn/lecture/15065670#questions/8272502

  // 1) first check if there's cookie in req.cookies (which generated by app.use(cookieParser()); in app.js)
  if (req.cookies.jwt) {

    try {

      // 2) verify TOKEN from cookie (which is the value from req.cookies.jwt)
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
      console.log(`The decoded result from \nawait promisify(jwt.verify)(token, process.env.JWT_SECRET); : \n`);
      console.log(decoded); // { id: '5ede44f1202c03583865838d', iat: 1591624946, exp: 1599400946 }
      /* how jwt.verify() works:
        #1. original payload: {
        "id": "5ed7cee559d9407250669d6e"
        }
        #2. Token generated (ref:  https://jwt.io/): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlZDdjZWU1NTlkOTQwNzI1MDY2OWQ2ZSJ9.E5PwSCrEy5UIZP4L7xuJdVFT-qTJG2OyzyMZMSBQGWw
      */

      // 3) Check if user still exists
      const currentUser = await User.findById(decoded.id);

      // if no currentUser found (no logged-in user), return next() function
      // !!! Important note !!!: Must use return key word to send next()
      // otherwise the next() will be executed again after this if statement block
      if (!currentUser) {
        return next();
      }

      // 4) If there's a user document , then check if user has changed password
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // 5) if all above 3 test are passed, it means the user is logged in and can move on to next middle ware
      //then store the document content of currently logged-in user in "res.locals.user" which will be accessible to .pug file via
      res.locals.user = currentUser;

      //ref for res.locals :  https://expressjs.com/en/api.html#res.locals
      //ref for res.render (will automatically use data from res.locals as arguments): https://expressjs.com/en/api.html#res.render
      return next();

    } catch (error) {

      //if there's any error occured, just go next middle ware function
      return next();
    }
    //end of if (req.cookies.jwt) {
  }

  // 6) if there's no cookie,
  // there won't be user document (which means no logged in user)
  next();
};


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
  try {

    const resetURL = `${req.protocol}://${req.get('host')}/api/va/users/resetPassword/${resetToken}`;

    /* // The code used previously for sending email to reset user's password //
    await sendEmail({ // use function imported(require) from './../utils/email'
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message: messageForResetting,
    });
    // Replace the code block above with the ones below */
    await new EmailWithNodeMailer(user, resetURL).sendPasswordReset();

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
  createSendToken(user, 200, req, res);



});

//will received document and ._id property from req.user passed-in from protect middlware
exports.updatePassword = catchAsync(async (req, res, next) => {

  console.log("\n\x1b[33m" + "The user: \"" + req.user.name + "\" is trying to update the password" + "\x1b[0m" + "\n"); //req.user is passed in from previous authController.protect middleware

  // 1) Get user from collection (.select password field and use the password for verification)
  const user = await User.findById(req.user.id).select('+password'); //takes 1.27 second
  // await User.findOne(req.user._id) is equivalent to User.findById(req.user.id)


  // 2) Check if the password from POSTed req is correct (matched with the password currently stored in database)

  // Via bcrypt.compare() in schema's user.correctPassword() , will get boolean value
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {

    console.log("\n\x1b[31m" + "The user: \"" + req.user.name + "\" has entered wrong password!" + "\x1b[0m" + "\n"); //req.user is passed in from previous authController.protect middleware

    return next(new AppError('Your current password is incorrect', 401));
  }

  // 3) If user's password if correct, user.correctPassword method will return Boolean
  if (
    (await user.correctPassword(req.body.passwordCurrent, user.password))
    // if this Boolean result is true, the
  ) {

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    // a) The USer Model's schama will compare if user.password user.passwordConfirm are matched

    // b) Then the password assigned to user.password will be hashed (encrypted) by bcryp by pre-middleware while the document is being saved by user.save() method

    await user.save();
    // user.save() will trigger pre-middleware in userModels to hash password with bcryp as the code below:
    // this.password = await bcrypt.hash(this.password, 12);

    // ref: https://mongoosejs.com/docs/api.html#model_Model-save

    // Log for password update is successful
    console.log("\n\x1b[32m" + "The user: \"" + req.user.name + "\" has successfully update the password" + "\x1b[0m" + "\n"); //req.user is passed in from previous authController.protect middleware



    // 4) Log user in, send JWT via createSendToken() function and res.cookie()
    createSendToken(user, 200, req, res);
  }


  console.log(`\n↑↑↑ Password updated at: ${timestamp} (UCT+8) ↑↑↑\n`);

});
