/*jshint esversion: 6 */
/*jshint esversion: 8 */
/*jshint esversion: 9 */

//
module.exports = (err, req, res, next) => {
  // use err.stack to show the trace of error log and which app or function throws the error.
  // Ex: from the const err = new Error(`Can't find ...) inside the function app.all('*', (req, res, next) => {
  console.log(`\n=== Error log track from errorController.js ( (err, req, res, next) => { ... ===\n`);
  console.log(err.stack);
  console.log(`\n=== End of Error log track from errorController.js ( (err, req, res, next) => { ... ===\n\n`);


  //to process income error code by express.js
  err.statusCode = err.statusCode || 500; // 500 is external server error
  err.status = err.status || 'error'; //err.status is 'fail' from the passed-in Error obj

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });

};
