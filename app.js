/*jshint esversion: 6 */
/*jshint esversion: 8 */
const fs = require('fs');
const express = require('express');
const morgan = require('morgan'); // https://www.npmjs.com/package/morgan

const app = express();

// 1) ============== MIDDLE-WARES
app.use(morgan('dev')); // https://www.npmjs.com/package/morgan#dev
app.use(express.json()); //middleware的使用解說參照git commit 54-1 Node.js Express 的 Middleware的使用 &解說
//to show when a request happened
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
  next();
});

// 2) ============== ROUTE-HANDLERS

//將JSON檔案轉成物件(Obj)檔案格式
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// get all data
const getAllTours = (req, res) => {

  //using newly create middleware function to log time
  console.log(`The requested was made at ${req.requestTime}`);
  // console.log('typeof(tours): ' + typeof(tours));
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours: tours,
    }
  });
};

// get only one result from Obj's "tours" array
const getTour = (req, res) => {
  //ex: 127.0.0.1:3000/api/v1/tours/5 的GET request 會顯示  "req.params": {"id": "5"}

  console.log('\n===== req.param is:');
  console.log(req.params);

  //在tours Array 裡面搜尋有key: id跟req.params相符內容，並透過find傳回整個符合條件的 Array
  const tour = tours.find(el => el.id === +req.params.id); //req.params.id前的+號是coersion為數值
  console.log(tour === undefined ? `%c invalid id input from URL: ${req.params.id}` : tour); // is a obj

  //to make sure user entered the correct id
  if (+req.params.id > tours.length || !tour) {
    //when can't find the correct id
    return res.status(404).json({
      status: "fail",
      message: "Invalid id",
      incorrect_input: req.params,
    });
  }

  res.status(200).json({
    status: 'success',
    inputs: {
      'req.params': req.params,
      'numberOfResults': "1",
      'tour': tour,
    }
  });
};

// create new data from POST request and assign it to current data obj
const createTour = (req, res) => {
  //middleware
  console.log("\n=== POST request received! The req.body is:");
  console.log(req.body);
  //give the POST request a "new id" based on the last item's id the array
  const newID = tours[tours.length - 1].id + 1;

  //透過Object.assign將req.body的內容(POST method)存到變數newTour
  const newTour = Object.assign({
    id: newID
  }, req.body);
  /*
  {
  	"name" : "Test tour",
  	"duration" : 10,
  	"difficulty" : "easy"
  }
  */

  //將新的newTour資料存入現有的 tours Array 資料中
  tours.push(newTour);

  //Asyncronous file writing method
  //fs.writeFile(file, data[, options], callback)
  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
    // 201 = created
    res.status(201).json({
      // then show created tour results from the POST request
      status: 'success',
      data: {
        tour: newTour,
      }
    });
  });

  console.log(`...New obj created via method : app.post('/api/v1/tours', createTour); `);
};

// updateTour
const updateTour = (req, res) => {
  //在tours Array 裡面搜尋有key: id跟req.params相符內容，並透過find傳回整個符合條件的 Array
  const tour = tours.find(el => el.id === +req.params.id); //req.params.id前的+號是coersion為數值
  console.log(tour === undefined ? `%c invalid id input from URL: ${req.params.id}` : tour); // is a obj

  // 如果傳入的id數值大於資料Array的長度，或是找不到資料
  if (+req.params.id > tours.length || !tour) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid id",
      incorrect_input: req.params,
    });
  }

  // 如果傳入資料正確 (無上列的if狀況發生)
  res.status(200).json({
    status: "success",
    message: "data patched!",
    data: {
      tour: 'updated content here...',
    }
  });

};

// deleteTour
const deleteTour = (req, res) => {
  //ex: 127.0.0.1:3000/api/v1/tours/5 的GET request 會顯示  "req.params": {"id": "5"}

  console.log('\n===== req.param for DELETE request is:');
  console.log(req.params);

  //在tours Array 裡面搜尋有key: id跟req.params相符內容，並透過find傳回整個符合條件的 Array
  const tour = tours.find(el => el.id === +req.params.id); //req.params.id前的+號是coersion為數值
  console.log(tour === undefined ? `%c invalid id input from URL: ${req.params.id}` : tour); // is a obj

  // to make sure user entered the correct id
  if (+req.params.id > tours.length || !tour) {
    //when can't find the correct id
    return res.status(404).json({
      status: "fail",
      message: "Invalid id",
      incorrect_input: req.params,
    });
  }

  // status 204 will not send out data to browser , only the status code 204
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

//2-2) ======= ROUTE-HANDLERS for user
/* for following routes
app.route('/api/v1/users').get(getAllUsers).post(createUser);
app.route('/api/v1/users/:id').get(getUser).patch(updateUser).delete(deleteUser);
*/
/* code template

const getAllUsers = (req, res) => {
  // 500 Internal Server Error
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
}; */
const getAllUsers = (req, res) => {
  // 500 Internal Server Error
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
const getUser = (req, res) => {
  // 500 Internal Server Error
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
const createUser = (req, res) => {
  // 500 Internal Server Error
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
const updateUser = (req, res) => {
  // 500 Internal Server Error
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
const deleteUser = (req, res) => {
  // 500 Internal Server Error
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};



// 3) ============== ROUTES

// 3-1) 針對 tour 跟 user的 express.Router 的 middleware 設定
// ==> creating and (mounting) new router (as a middleware & sub-application to be able to change URL)
const tourRouter = express.Router(); //
const userRouter = express.Router(); //

// 3-2) 將 app.get('/api/v1/tours', getAllTours) 跟 app.post('/api/v1/tours', createTour) 改寫為以下
tourRouter.route('/').get(getAllTours).post(createTour);
// 將 app.route('/api/v1/tours/:id').get(getTour).patch(updateTour).delete(deleteTour); 改寫為以下
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

// 3-3) route actions for users
userRouter.route('/').get(getAllUsers).post(createUser); //從 app.route('/api/v1/users').get 換成 userRouter.route('/').get
// route actions for SINGLE user
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

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
