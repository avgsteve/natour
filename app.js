/*jshint esversion: 6 */
/*jshint esversion: 8 */
const express = require('express');
const morgan = require('morgan'); // https://www.npmjs.com/package/morgan
const dotenv = require('dotenv'); // ref:  https://www.npmjs.com/package/dotenv
const responseSize = require('express-response-size');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');

// for reading Environment Variables from config.env file
dotenv.config({
  path: './config.env'
});

// console.log(process.env.NODE_ENV); //若只有process.env 則會列出所有property

//import the relocated codes for route-handlers and router from corresponding files
const AppError = require('./utils/appError'); // appError.js
const globalErrorHandler = require('./controllers/errorController'); // appError.js
const tourRouter = require('./routes/tourRoutes'); // tourRoutes.js
const userRouter = require('./routes/userRoutes'); // userRoutes.js
const reviewRouter = require('./routes/reviewRoutes');
const startServer = require('./server'); // server.js


const app = express();

//
app.set('view engine', 'pug');
//will create a path with a joined path name
app.set('views', path.join(__dirname, 'views'));

// 1) ============== MIDDLE-WARES ==============

// === SERVING STATIC FILES ===
// build-in middleware "express.static" for serving static file like .html
// app.use(express.static(`${__dirname}/public`)); //https://expressjs.com/en/starter/static-files.html
app.use(express.static(path.join(__dirname, 'public')));


// ===== SECURING http header ======
// Helmet helps you set and secure your Express apps by setting various HTTP headers.
app.use(helmet()); //https://www.npmjs.com/package/helmet

// ===== HTTP request logger middleware for node.js ======
// 67. Environment Variables: 透過 env variable 來控制 development 或是 production stage 的某些 middleware是否要啟用
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // https://www.npmjs.com/package/morgan#dev
}

// === req.body parser . Reading data from body into req.body===
app.use(express.json({
  limit: '10kb',
})); //middleware的使用解說參照git commit 54-1 Node.js Express 的 Middleware的使用 &解說


// === Data sanitization against NoSQL query injection attack ===
app.use(mongoSanitize()); //https://www.npmjs.com/package/express-mongo-sanitize

// === Data sanitization against Cross-Site Scripting (XSS) attacks ===
app.use(xss()); //https://www.npmjs.com/package/xss-clean

// Prevent parameter pollution
app.use(hpp({
  whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'],
}));


// ===== REQUEST Limiter for IP ======
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour.',
  //ref:  https://www.npmjs.com/package/express-rate-limit
});

app.use('/api', limiter);




// //for testing middleware
// app.use((req, res, next) => {
//   console.log('\n\n=== this is a middleware log from app.js\n');
//   next();
// });
//
app.use(responseSize((req, res, size) => {
  const stat = `${req.method} - ${req.url.replace(/[:.]/g, '')}`;
  const convertedSize = Math.round(size / 1024);
  const outputSize = `${convertedSize}kb`;

  console.log("\nSize of current reponse:" + "\x1b[33m" + ` ${outputSize} (${size}bytes)` + "\x1b[0m");

  // fs.appendFile(path.join(__dirname, '..', 'logs', 'benchmark-size.csv'), `${stat},${outputSize}\n`);
  // IE: shove into a database for further analysis, wait, spreadsheets are databases, right?
}));

// === Test middleware ===
// to show WHEN a request happened
app.use((req, res, next) => {
  req.requestTime = new Date()
    .toISOString(); // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
  // console.log("Test error for undefined ' x':" + x); //D:\\Dropbox\\Udemy\\JavaScript\\complete-node-bootcamp\\4-natours\\app.js:58:49\n    at Layer.handle [as handle_request]
  next();
});

// 2) ============== ROUTE-HANDLERS (moved to ./routes/tourRoutes.js &  ./routes/userRoutes.js)
// ex:  const getAllTours = (req, res) => { ....

// 3) ============== ROUTES ()
// //
app.get('/', (req, res) => {
  //render base.pug
  res.status(200).render('base');
  //note: This middle ware function reads setting from the code in this app.js file as below:

  // app.set('view engine', 'pug');
  // //will create a path with a joined path name
  // app.set('views', path.join(__dirname, 'views'));

});


// --->>> 3-1)  *針對 tour 跟 user的 express.Router (middleware) 設定
// --->>> const tourRouter = express.Router();      //移到 tourRouter.js

// --->>> 3-2) 將 tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);    移到 tourRouter.js，針對此URI '/api/v1/tours'  改為使用 tourRouter middleware的方式作為 router
app.use('/api/v1/tours', tourRouter);

// --->>> 3-3) 將 route actions for users  //移到 tourRouter.js，針對此URI '/api/v1/users'  改為使用 middleware的方式作為 router
app.use('/api/v1/users', userRouter);

//
app.use('/api/v1/reviews', reviewRouter);


// =============== GLOBAL ERROR HANDLING MIDDLEWARE ===============
//handles all the other routes besides above
app.all('*', (req, res, next) => {

  // Use AppError as the object to pass into the next() as argument
  // (ref: By using err as argument, the middleware stack will skip to app.use((err))  )
  //
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});


// error-first function which its main taks is to handle errors only and is the next() function called by app.all

app.use(globalErrorHandler); // the module from errorController.js. will be the next() from app.all

// =============== GLOBAL ERROR HANDLING MIDDLEWARE ===============

/*
git commit records of how to refactor routes into concise code
1. app.route('/api/v1/tours'). ....
https://github.com/avgsteve/natour/commit/731c2b4b05e3fe62019cb1a0cf2f2e9134737051
*/

module.exports = app; // export all config in "app" as a standalone module

// 4) ============== START THE SERVER
/* (---=== moved below to server.js ===---)
const port = 3000; // the port to be used for the localhost page
app.listen(port, () => {
  console.log(`App running on port ${port}...\nThe address is: http://127.0.0.1:${port}`);
});
*/
