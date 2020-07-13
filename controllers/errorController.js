/*jshint esversion: 6 */
/*jshint esversion: 8 */
/*jshint esversion: 9 */
const timeStamp = require('./../utils/timeStamp');
const timestamp = timeStamp.getTimeStamp(); // use console.log(`\nCurrent time : ${timestamp} (UCT+8)`);
const AppError = require('./../utils/appError');
//transform the mongoose err obj to easy-to-ready AppError obj
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.}`;
  return new AppError(message, 400);
};

//
const handleDuplicateFieldsDB = err => {

  const errors = Object.values(err.errors).map();

  //err.msg is from err obj's property from mongoose
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  console.log('\n');
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;

  return new AppError(message, 400);
};


const handelValidationErrorDB = err => {

  //To get all values (error log) from element's any property has 'errors property'
  // Different validation error will create different names which has their own individual property
  const errors = Object.values(err.errors).map(el => el.message);

  console.log('The modified error:\n');
  console.log(errors);

  const message = `Invalid input data: ${errors.join(". ")}.`;

  return new AppError(message, 400);

};


const handelJWTError = () => {
  return new AppError("Invalid token. Please log in again!", 401);
};

const handelJWTExpiredError = () => {
  return new AppError("Your token has expired! Please log in again!", 401);
};


const sendErrorDev = (err, req, res) => {

  // === Condition 1) API (related to tour and user) ERROR and display error message as json format when the error is from URL starts with /api ===
  if (req.originalUrl.startsWith('/api')) {

    console.error('\nERROR (related to API/data ) 💥\n', err);

    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  // === Condition 2) RENDERING error in web page if is not an error related to API (like wrong slug for tour data)

  console.error('\nERROR (related to tour routes/slug)💥\n', err);

  // render error.pug for displaying error message in web page when it's error from entering the tour route (slug) doesn't exist
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  });

};

// Error message in production mode
const sendErrorProd = (err, req, res) => {

  // Condition 1) API (related to tour and user) ERROR and display error message as json format when the error is from URL starts with /api ===
  if (req.originalUrl.startsWith('/api')) {

    // console.error('\nERROR (related to API/data) 💥\n', err);

    // A) if it's an operational and trusted error, then it can be sent to client
    if (err.isOperational) {

      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    // B) if it's an programming or other unknown error can't be leaked to client

    console.error('ERROR 💥', err);

    // Then sending generic error code
    res.status(err.statusCode).json({
      status: 'error',
      message: 'Something went wrong!',
    });

    //end of if (req.originalUrl.startsWith('/api')) {
  }


  // === Condition 2) URL not starts with /api. (such as /tour-slug)
  // Then RENDERING error in web page

  // A) if it's an operational and trusted error, then it can be sent to client
  if (err.isOperational) {
    // 1) Log error
    // console.log(err.message);
    console.error('\nERROR (related to tour routes/slug)💥\n');
    console.log(err);

    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });

  }

  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR 💥', err);
  // 2) Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.'
  });

  // end of const sendErrorProd = (err, req, res) => {
};


//a middleware to show the trace of error log and which app or function throws the error.
module.exports = (err, req, res, next) => {
  // used by app.use(globalErrorHandler; in app.js

  // use err.stack to
  // Ex: from the const err = new Error(`Can't find ...) inside the function app.all('*', (req, res, next) => {
  console.log(`\n=== Error log track from errorController.js ( (err, req, res, next) => { ... ===\n`);
  console.log(err.stack);
  console.log(`\n↑↑↑ The error is logged at: ${timestamp} (UCT+8) ↑↑↑\n`);
  console.log(`\n=== End of Error log track from errorController.js ( (err, req, res, next) => { ... ===\n\n`);

  //to process income error code by express.js
  err.statusCode = err.statusCode || 500; // 500 is external server error
  err.status = err.status || 'error'; //err.status is 'fail' from the passed-in Error obj

  //use environment variable to send dev or production error
  if (process.env.NODE_ENV === 'development') {

    //send Error info for dev mode
    sendErrorDev(err, req, res);

  } else if (process.env.NODE_ENV === 'production') {

    //make a hard-copy of err by destructuring (as it's better not to modify the parameter of the function)
    let error = {
      ...err
      /* sample data of error log
      "error": {
              "message": "Cast to ObjectId failed for value \"asdasda\" at path \"_id\" for model \"Tour\"",
              "name": "CastError",
              "stringValue": "\"asdasda\"",
              "kind": "ObjectId",
              "value": "asdasda",
              "path": "_id",
              "reason": {},
              "statusCode": 500,
              "status": "error"
          },
      */
    };

    error.message = err.message;

    //
    // 'CastError' is from res.status(err.statusCode).json({  error: err, when the data id doesn't match (wrong id)
    if (err.name === 'CastError') {
      //transform the mongoose err obj to easy-to-ready AppError obj
      error = handleCastErrorDB(error);
    }

    //When have the same (duplicated) data name
    if (error.code === 11000) error = handleDuplicateFieldsDB(error); //transform the mongoose err obj to customized error message

    /* error obj before being modified:

    Error! {
      driver: true,
      name: 'MongoError',
      index: 0,
      code: 11000,
      keyPattern: { name: 1 },
      keyValue: { name: 'Test tour data duplicate' },
      errmsg: 'E11000 duplicate key error collection: natours.tours index: name_1 dup key: { name: "Test tour data duplicate" }',
      statusCode: 500,
      status: 'error',
      [Symbol(mongoErrorContextSymbol)]: {}
    }


    error obj after being modified :
    {
        "status": "fail",
        "message": "Duplicate field value: \"Test tour data duplicate\". Please use another value!"
    }

    */

    if (error.name === "ValidationError") error = handelValidationErrorDB(error);

    if (error.name === "JsonWebTokenError") error = handelJWTError();
    /*{
        "status": "error",
        "error": {
            "name": "JsonWebTokenError",
            "message": "invalid signature",
            "statusCode": 500,
            "status": "error"
        },*/
    if (error.name === "TokenExpiredError") error = handelJWTExpiredError();

    /*{
        "status": "error",
        "error": {
            "name": "TokenExpiredError",
            "message": "jwt expired",
            "expiredAt": "2020-06-07T15:42:21.000Z",
            "statusCode": 500,
            "status": "error"
        },*/
    // console.log('\n\nerror:\n');
    // console.log(err);
    // console.log('\n\nerror message:\n');
    // console.log(err.message);

    sendErrorProd(err, req, res);
  }


};
