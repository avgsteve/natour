/*jshint esversion: 6 */
/*jshint esversion: 8 */
const path = require('path');
const scriptName = path.basename(__filename);
const dotenv = require('dotenv');
const mongoose = require('mongoose');

//Create a class-like "Schema" to descript the data
const Schema = mongoose.Schema;
//mongoosejs.com/docs/guide.html#models

const tourSchema = new Schema({
  // schema options ref:
  // https://mongoosejs.com/docs/guide.html#definition
  name: {
    type: String,
    required: [true, "A tour must have a name"],
    unique: true,
    // "require" and "unique" properties are the type of obj prop is the "schema type option"
    // ref:  https://mongoosejs.com/docs/schematypes.html#schematype-options
    trim: true
  },
  duration: {
    type: Number,
    required: [true, "A tour must have a duration"],
  },
  maxGroupSize: {
    type: Number,
    required: [true, "A tour must have a group size (maxGroupSize)"],
  },
  difficulty: {
    type: String,
    required: [true, "A tour must have a difficulty level"],
  },
  ratingAverage: {
    type: Number,
    default: 4.5,
  },
  ratingQuantity: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, "A tour must have a price"],
  },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true, //trim: boolean, whether to always call .trim() on the value  ref:  https://mongoosejs.com/docs/schematypes.html#schematype-options
    required: [true, "A tour must have a price"],
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, "A tour must have a price"],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  startDates: [Date]
});

// // make a collection based on the tourSchema by using model constructors function.
// // // Ex: mongoose.model('collectionName', SchemaName) will be "collectionNames" shown on database collection
//
// ref:  https://mongoosejs.com/docs/models.html#compiling
const Tour = mongoose.model('Tour', tourSchema);

// export the Tour as a mongoose model obj to be used by other files
module.exports = Tour;



/*
const testTour = new Tour({
  name: 'The Forest Hiker test',
  rating: 4.7,
  price: 999,
});
*/
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
