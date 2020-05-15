/*jshint esversion: 6 */
/*jshint esversion: 8 */
const fs = require('fs');
const express = require('express');

//將JSON檔案轉成物件(Obj)檔案格式
const tours = JSON.parse(
  // fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

// 2) ============== ROUTE-HANDLERS
// // ===> get all data
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

// 2-1) ROUTE-HANDLERS with " params from router.route('/:id') "
// ===> get only one result from Obj's "tours" array
const getTour = (req, res) => {
  // req來自於 router.route('/:id').get(getTour)，params property key為 :id
  // to log the current req params from URI
  console.log('\n===== req.param is:');
  console.log(req.params);
  //ex: 127.0.0.1:3000/api/v1/tours/5 的GET request 會顯示  "req.params": {"id": "5"}


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

// ===> create new data from POST request and assign it to current data obj
const createTour = (req, res) => {
  //middleware
  console.log("\n=== POST request received! The req.body is:");
  console.log(req.body);
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

// ===> updateTour
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

//// ===> deleteTour
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

// 3) ============== ROUTES
// Router 部分
const router = express.Router(); //原本是 const tourRouter = express.Router(); 因為需要按照convention去export router的關係就改掉

router.route('/').get(getAllTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

// 以下是從app.js移過來，原本的的內容，改成以上方式 (by convention)
// const tourRouter = express.Router(); //
//
// tourRouter.route('/').get(getAllTours).post(createTour);
// tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
