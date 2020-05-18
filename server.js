/*jshint esversion: 6 */
/*jshint esversion: 8 */
const path = require('path');
const scriptName = path.basename(__filename);
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({
  path: './config.env'
});

//use DB and replace password string with env
const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);
// will return a promise obj
mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true // to hide deprication error warbubg message in terminal
}).then(connection => {
  //to show connections properties
  console.log(connection.connections);
  console.log("\nDB connections successful!  (●'◡'●)");
});

const app = require("./app"); // getting all config from app.js , so use nodemon server.js to start server

const port = process.env.PORT || 3000; // the port to be used for the localhost page

app.listen(port, () => {
  console.log(`(from ${scriptName}:) === App running on port ${port}...\nThe address is: http://127.0.0.1:${port}  (✿◠‿◠) (●'◡'●) \n`);
});
