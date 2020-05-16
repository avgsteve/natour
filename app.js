/*jshint esversion: 6 */
/*jshint esversion: 8 */
const express = require('express');
const morgan = require('morgan'); // https://www.npmjs.com/package/morgan
const dotenv = require('dotenv'); // ref:  https://www.npmjs.com/package/dotenv

// for reading Environment Variables from config.env file
dotenv.config({
  path: './config.env'
});

console.log(process.env.NODE_ENV); //若只有process.env 則會列出所有property

//import the relocated codes for route-handlers and router from corresponding files
const tourRouter = require('./routes/tourRoutes'); // tourRoutes.js
const userRouter = require('./routes/userRoutes'); // userRoutes.js
const startServer = require('./server'); // server.js


const app = express();

// 1) ============== MIDDLE-WARES

// 67. Environment Variables: 透過 env variable 來控制 development 或是 production stage 的某些 middleware是否要啟用
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // https://www.npmjs.com/package/morgan#dev
}
app.use(express.json()); //middleware的使用解說參照git commit 54-1 Node.js Express 的 Middleware的使用 &解說

// build-in middleware "express.static" for serving static file like .html
app.use(express.static(`${__dirname}/public`)); //https://expressjs.com/en/starter/static-files.html
//the URL for page is http://127.0.0.1:3000/overview.html as the app.use doesn't set any router

//for testing middleware
app.use((req, res, next) => {
  console.log('\n=== this is a middleware log from app.js\n');
  next();
});
//to show WHEN a request happened
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
  next();
});

// 2) ============== ROUTE-HANDLERS (moved to ./routes/tourRoutes.js &  ./routes/userRoutes.js)
// ex:  const getAllTours = (req, res) => { ....

// 3) ============== ROUTES ()
// --->>> 3-1)  *針對 tour 跟 user的 express.Router (middleware) 設定
// --->>> const tourRouter = express.Router();      //移到 tourRouter.js

// --->>> 3-2) 將 tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);    移到 tourRouter.js，針對此URI '/api/v1/tours'  改為使用 tourRouter middleware的方式作為 router
app.use('/api/v1/tours', tourRouter);

// --->>> 3-3) 將 route actions for users  //移到 tourRouter.js，針對此URI '/api/v1/users'  改為使用 middleware的方式作為 router
app.use('/api/v1/users', userRouter);

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
