/*jshint esversion: 6 */
/*jshint esversion: 8 */
const path = require('path');
const scriptName = path.basename(__filename);
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const slugify = require('slugify');

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
    slug: {
      type: String,
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
      required: [true, "A tour must have a summary"],
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a imageCover"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, //won't be exported to the query result. ref:  https://mongoosejs.com/docs/api.html#schematype_SchemaType-select
    },
    startDates: [Date]
  },
  //the second parameter (obj) is schema options
  {
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    },
  }
);

//virtual property (get() is getter and means using getter function)
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7; // ex: seven day is one week
});

//pre-middleware (or pre-save hook) runs before .save() , create() command
tourSchema.pre('save',
  //the second parameter is a function and its  parameter "next" is for the default next() function
  function(next) {
    //
    console.log(`\n=== log for tourSchema.pre('save',...) middleware:\nDisplaying current processed document before .save() :\n`);
    console.log(this);
    console.log('\n');
    //create slug based on tour name using slugify
    this.slug = slugify(this.name, {
      lower: true
    });

    next();
  });

//second .pre middleware
tourSchema.pre('save', function(next) {
  console.log(`\nNow save document...\n`);
  next();
});

//post-middleware runs after .save() , create() command
tourSchema.post('save', function(doc, next) {
  console.log("\nThe post-middleware for doc after the pre-middleware\n");
  console.log(doc);
  console.log('\n');
  next();
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
