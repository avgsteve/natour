/*jshint esversion: 6 */
/*jshint esversion: 8 */
const express = require('express');

const app = express();
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

app.get('/api/v1/tours', (req, res) => {

});


const port = 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}...\nThe address is: http://127.0.0.1:${port}`);
});
