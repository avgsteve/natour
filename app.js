/*jshint esversion: 6 */
/*jshint esversion: 8 */
const express = require('express');

const app = express();

//http method, how to response to request
app.get('/', (res, req) => {
  res.status(200).send('Hello from the server side! :)');

});

const port = 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
