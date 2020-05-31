/*jshint esversion: 6 */
/*jshint esversion: 8 */
/*jshint esversion: 9 */
const path = require('path');
const scriptName = path.basename(__filename);
const Tour = require('./../models/tourModel');


//  use and modify built-in Error class as new error-handling Object which has certain property containing specific error information
//  and the obj will be used in next() is app.js and inside the function app.all("*", .... )  like:
//  next( new AppError(`Can't find ${req.orinalUrl} on this server!`,   404)    );

class AppError extends Error {
  //ref:  https://nodejs.org/api/errors.html#errors_class_error

  constructor(message, statusCode) {

    //calling super() (the parent Class Error) and pass in the error message to update the "message property"
    super(message);

    //add new property to the new class "AppError"
    this.statusCode = statusCode;

    //use JS built-in .startsWith() function to read string and return Boolean as the value of this.status property
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    //The property .isOperational is used to show "There's an operational error" instead of a "coding" error
    this.isOperational = true;

    // Error.captureStackTrace(targetObject[, constructorOpt])
    // Creates a .stack property on "this" and returns a string representing the location in the code at which Error.captureStackTrace() was called.
    Error.captureStackTrace(this, this.constructor);
    //ref:  https://nodejs.org/api/errors.html#errors_error_capturestacktrace_targetobject_constructoropt

  }

}

module.exports = AppError;
