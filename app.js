/*jshint esversion: 6 */
/*jshint esversion: 8 */
const fs = require('fs');
const express = require('express');
const app = express();
//app.use(express.json()) ==> middleware: can modify incoming data
//http://expressjs.com/en/api.html#express
app.use(express.json());


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

//將JSON檔案轉乘物件檔案格式
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

//設定GET request 會傳到瀏覽器的內容，傳出的內容為JSON格式的資料
app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours,
    }
  });
});

//設定POST request and add new data
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
      status: 'success',
      data: {
        tour: newTour,
      }
    });
  });

  // res.send('Done');
  console.log('...New obj created!');
});


const port = 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}...\nThe address is: http://127.0.0.1:${port}`);
});
