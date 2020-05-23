/*jshint esversion: 6 */
/*jshint esversion: 8 */
const path = require('path');
const scriptName = path.basename(__filename);
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({
  path: './config.env'
});

//==============  DATABASE RELATED SECTION  ================

//use DB and replace password string with env
const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);

// ------- Mongoose ------------

// will return a promise obj with using Mongoose
mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true // to hide deprication error warning message in terminal
}).then(connection => {
  //to show connections properties
  // console.log(connection.connections);
  console.log("\n\nConnection is successful!  (●'◡'●)\n\n");
});



//=======================================================


const app = require("./app"); // getting all config from app.js , so use nodemon server.js to start server

const port = process.env.PORT || 3000; // the port to be used for the localhost page

app.listen(port, () => {
  console.log(`\n\n(from ${scriptName}:) === App running on port:
${port}... \nThe full address is: http://127.0.0.1:${port}\n`);

  //IIFE with a IIFE has a delayed log
  (
    () => {
      setTimeout(() => {
        console.log("Establishing connection to database ...");
      }, 1000);
    }
  )();

});
