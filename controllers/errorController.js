/*jshint esversion: 6 */
/*jshint esversion: 8 */
/*jshint esversion: 9 */
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


const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {

  //err.isOperational property is from class AppError extends Error {
  //Operational, trusted error: send message to client
  if (err.isOperational) {

    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    //Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('Error!', err);

    // 2) sending generic error code
    res.status(err.statusCode).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

//a middleware to show the trace of error log and which app or function throws the error.
module.exports = (err, req, res, next) => {
  // used by app.use(globalErrorHandler; in app.js

  // use err.stack to
  // Ex: from the const err = new Error(`Can't find ...) inside the function app.all('*', (req, res, next) => {
  console.log(`\n=== Error log track from errorController.js ( (err, req, res, next) => { ... ===\n`);
  console.log(err.stack);
  console.log(`\n=== End of Error log track from errorController.js ( (err, req, res, next) => { ... ===\n\n`);

  //to process income error code by express.js
  err.statusCode = err.statusCode || 500; // 500 is external server error
  err.status = err.status || 'error'; //err.status is 'fail' from the passed-in Error obj

  //use environment variable to send dev or production error
  if (process.env.NODE_ENV === 'development') {

    //send Error info for dev mode
    sendErrorDev(err, res);

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

    sendErrorProd(error, res);
  }


};
