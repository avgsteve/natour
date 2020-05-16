/*jshint esversion: 6 */
/*jshint esversion: 8 */
const fs = require('fs');
const path = require('path');
const scriptName = path.basename(__filename);

// 1) ============== middleware functions
//// 將JSON檔案轉成物件(Obj)檔案格式
const tours = JSON.parse(
  // fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

//// Check id middleware :  to make sure user entered the correct id. Export this function
exports.checkID = (req, res, next, val) => {
  console.log(`\n(From tourControllers.js, checkID middleware.) \nthe param for 'id' is: ${val}`);

  //when the input in is not correct
  if (+val > tours.length) {
    console.log(`invalid id input from URL: ${val}`);

    return res.status(404).json({
      status: "fail",
      message: "Invalid id",
      incorrect_input: req.params,
    });
  }

  next();
};


// 2) ============== ROUTE-HANDLERS
// // ===> get all data
// exports.getAllTours = (req, res) => { 將 宣告變數的 const 改為 exports.
exports.getAllTours = (req, res) => {
  //using newly create middleware function to log time
  console.log(` (from ${scriptName}:) The requested was made at ${req.requestTime}`);
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
exports.getTour = (req, res) => {
  // req來自於 router.route('/:id').get(getTour)，params property key為 :id
  // to log the current req params from URI
  console.log(`\n (from ${scriptName}:) ===== req.param is:`);
  console.log(req.params);
  //ex: 127.0.0.1:3000/api/v1/tours/5 的GET request 會顯示  "req.params": {"id": "5"}


  //在tours Array 裡面搜尋有key: id跟req.params相符內容，並透過find傳回整個符合條件的 Array
  const tour = tours.find(el => el.id === +req.params.id); //req.params.id前的+號是coersion為數值

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
exports.createTour = (req, res) => {
  //middleware
  console.log(`\n===  (from ${scriptName}:) POST request received! The req.body is:`);
  console.log(req.body);
  //to give this new input a new id
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
exports.updateTour = (req, res) => {
  //在tours Array 裡面搜尋有key: id跟req.params相符內容，並透過find傳回整個符合條件的 Array
  exports.tour = tours.find(el => el.id === +req.params.id); //req.params.id前的+號是coersion為數值

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
exports.deleteTour = (req, res) => {
  //ex: 127.0.0.1:3000/api/v1/tours/5 的GET request 會顯示  "req.params": {"id": "5"}

  console.log('\n===== req.param for DELETE request is:');
  console.log(req.params);

  //在tours Array 裡面搜尋有key: id跟req.params相符內容，並透過find傳回整個符合條件的 Array
  exports.tour = tours.find(el => el.id === +req.params.id); //req.params.id前的+號是coersion為數值

  // status 204 will not send out data to browser , only the status code 204
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
