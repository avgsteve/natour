/*jshint esversion: 6 */
/*jshint esversion: 8 */
const fs = require('fs');
const express = require('express');
const app = express();
//app.use(express.json()) ==> middleware: can modify incoming data
//http://expressjs.com/en/api.html#express
app.use(express.json()); //middleware的使用解說參照git commit 54-1 Node.js Express 的 Middleware的使用 &解說

/* REFERENCE
//http method, when browser sends a get request
app.get('/', (req, res) => {
  //// ==== send message via .send method (see ref: http://expressjs.com/en/api.html#res.status)
  // res.status(200).send('Hello from the server side! :)');
  // ==== send .json via .json method
  res.status(200).json({
    message: 'Hello from the server side! :)',
    app: 'Natours',
  });
  //// ====
  // res.status(200).json(req);
  // console.log(req);
});

//// http method, when browser sends a get request
// app.post(path, callback [, callback ...])  // ref: http://expressjs.com/en/api.html#app.post.method
app.post('/', (req, res) => {
  res.send("This is a response to the POST request! 🧡");
});
*/

//將JSON檔案轉成物件檔案格式
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

//設定GET request 會傳內容為JSON格式的資料到瀏覽器，
app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours,
    }
  });
});

//設定POST request 收到資料後之後將 new data
app.post('/api/v1/tours', (req, res) => {
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

  // res.send('Done');
  console.log('...New obj created!');
});

//將路徑的:id的內容透過.params顯示
app.get('/api/v1/tours/:id', (req, res) => {
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
});

//
app.patch('/api/v1/tours/:id', (req, res) => {
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

});

const port = 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}...\nThe address is: http://127.0.0.1:${port}`);
});
