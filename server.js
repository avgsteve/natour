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
  console.log(connection.connections);
  console.log("\nDB connections successful!  (●'◡'●)");
});

//Create a class-like "Schema" to descript the data
const Schema = mongoose.Schema;
//mongoosejs.com/docs/guide.html#models

const tourSchema = new Schema({
  //schema options ref:  https://mongoosejs.com/docs/guide.html#definition
  name: {
    //this type of obj prop is the "schema type option"
    type: String,
    required: [true, "A tour must have a name"],
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: String,
    required: [true, "A tour  must have a price"],
  },
});

// // make a collection based on the tourSchema by using model constructors function
// ref:  https://mongoosejs.com/docs/models.html#compiling
const Tour = mongoose.model('Tour', tourSchema);

const testTour = new Tour({
  name: 'The Forest Hiker test',
  rating: 4.7,
  price: 999,
});
/*  see Git commit comments for MVC models
//save() ref:  https://mongoosejs.com/docs/api.html#document_Document-save
testTour.save(
  //.save() will return a promise
).then(doc => {
  console.log("\nNew document saved!:\n");
  console.log(doc);
}).catch(err => {
  console.log("\nOops there's an error!: \n");
  console.log(err);
});
*/


//=======================================================


const app = require("./app"); // getting all config from app.js , so use nodemon server.js to start server

const port = process.env.PORT || 3000; // the port to be used for the localhost page

app.listen(port, () => {
  console.log(`(from ${scriptName}:) === App running on port ${port}...\nThe address is: http://127.0.0.1:${port}  (✿◠‿◠) (●'◡'●) \n`);
});
