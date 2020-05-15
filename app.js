/*jshint esversion: 6 */
/*jshint esversion: 8 */
const express = require('express');
const morgan = require('morgan'); // https://www.npmjs.com/package/morgan

//import the relocated codes for route-handlers and router from corresponding files
const tourRouter = require('./routes/tourRoutes'); // tourRoutes.js
const userRouter = require('./routes/userRoutes'); // userRoutes.js

const app = express();

// 1) ============== MIDDLE-WARES
app.use(morgan('dev')); // https://www.npmjs.com/package/morgan#dev
app.use(express.json()); //middleware的使用解說參照git commit 54-1 Node.js Express 的 Middleware的使用 &解說
//to show when a request happened
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
  next();
});

// 2) ============== ROUTE-HANDLERS (moved to ./routes/tourRoutes.js &  ./routes/userRoutes.js)
// 3) ============== ROUTES
//// 3-1) 針對 tour 跟 user的 express.Router (middleware) 設定
//// const tourRouter = express.Router(); //移到 tourRouter.js

//// 3-2) 將 tourRouter.route('/').get(getAllTours).post(createTour);
//// 和 tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour); 移到 tourRouter.js

//// 3-3) route actions for users

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

/*
git commit records of how to refactor routes into concise code
1. app.route('/api/v1/tours'). ....
https://github.com/avgsteve/natour/commit/731c2b4b05e3fe62019cb1a0cf2f2e9134737051
*/

// 4) ============== START THE SERVER

const port = 3000; // the port to be used for the localhost page
app.listen(port, () => {
  console.log(`App running on port ${port}...\nThe address is: http://127.0.0.1:${port}`);
});
