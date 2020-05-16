/*jshint esversion: 6 */
/*jshint esversion: 8 */
const path = require('path');
const scriptName = path.basename(__filename);


const app = require("./app"); // getting all config from app.js , so use nodemon server.js to start server

const port = 3000; // the port to be used for the localhost page

app.listen(port, () => {
  console.log(`(from ${scriptName}:) === App running on port ${port}...\nThe address is: http://127.0.0.1:${port}  (✿◠‿◠) (●'◡'●) \n`);
});
