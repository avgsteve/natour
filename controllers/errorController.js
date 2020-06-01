/*jshint esversion: 6 */
/*jshint esversion: 8 */
/*jshint esversion: 9 */

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


module.exports = (err, req, res, next) => {
  // use err.stack to show the trace of error log and which app or function throws the error.
  // Ex: from the const err = new Error(`Can't find ...) inside the function app.all('*', (req, res, next) => {
  console.log(`\n=== Error log track from errorController.js ( (err, req, res, next) => { ... ===\n`);
  console.log(err.stack);
  console.log(`\n=== End of Error log track from errorController.js ( (err, req, res, next) => { ... ===\n\n`);

  //to process income error code by express.js
  err.statusCode = err.statusCode || 500; // 500 is external server error
  err.status = err.status || 'error'; //err.status is 'fail' from the passed-in Error obj

  //use environment variable to send dev or production error
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    sendErrorProd(err, res);
  }


};
