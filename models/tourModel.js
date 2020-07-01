/*jshint esversion: 6 */
/*jshint esversion: 8 */
const path = require('path');
const scriptName = path.basename(__filename);
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');
// const Review = require('./reviewModel');


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
      trim: true,
      maxlength: [40, 'A tour name must be less or equal to then 40 characters'],
      minlength: [10, 'A tour name must be higher or equal to then 40 characters'],
      //using validator package to perform validation. Use it in array index [0] for the returning Boolean value
      // validate: [validator.isAlpha, "Tour name must container only regular alphabet."]
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
      //enum: limit the input options
      enum: {
        values: ['easy', 'medium', 'difficult'],
        //可以將enum傳出的props for error當作錯誤內容作運用
        message: props => `The input value: "${props.value}" is invalid. The difficulty must be easy, medium or difficult`,
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be higher than or equal to 1'],
      max: [5, 'Rating must be higher than or equal to 5'],
      //
      set: val => Math.round(val * 10) / 10 //ex: 4.6666, 46.66, 47 ,4.7

    },
    ratingsQuantity: {
      type: Number,
      default: 4.5,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        //#1 the function used as validator
        validator: function(value) {
          return value < this.price; //#1 make sure the discount price is not higher than regular price. If true will return the true Boolean value to the validate'property. Otherwise this customized validate won't be passed coz this value is false.
          //#2 "this" keyword points to ONLY the document that is being created from POST request
        },
        //#2 The error message
        // message: props => `Discount price ($${props.value}) must below regular price`,
        // // Mongoose internal access的寫法
        message: "Discount price ({VALUE}) must below regular price",

      }
    },
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
    startDates: [Date],
    secretTour: {
      type: Boolean, //if true , this data doesn't show
      default: false,
    },
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [{
      //type: GeoJSON
      type: {
        type: String,
        default: 'Point',
        // enum validator: check if data is in Array
        enum: ['Point']
      },
      // other infomation for locations field
      coordinates: [Number],
      address: String,
      description: String,
      day: Number, //the days people will spend on the tour
    }],
    // embedded data
    // guides: Array,
    guides: [{
      //another way of embedding data
      // type: Schema.Types.ObjectId, //this way works too
      type: mongoose.Schema.ObjectId,
      //connect to User model
      ref: 'User',
    }],
    /*
    // virtual property
    reviews: [{
      type: mongoose.Schema.ObjectId,
      //connect to Review model
      ref: 'Review'
    }]
    */
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

// tourSchema for index which can reduce time by get results only from certain repeated search instead of scanning all documents every timeout
// query needs to be:   const doc = await features.query.explain();  to see that effect in POSTMAN
tourSchema.index({
  price: 1,
  ratingsAverage: -1
});

//
tourSchema.index({
  slug: 1
});


//for using geospatial in the document
tourSchema.index({
  startLocation: '2dsphere',

  //ref: https://docs.mongodb.com/manual/core/2dsphere/#dsphere-indexes
});

//virtual property (get() is getter and means using getter function)
//usage: virtual('nameOfVirtualFields')
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7; // ex: seven day is one week
});

//
// set virtual property inside tour document to link the document to review data

// usage: virtual('nameOfVirtualFields', objOfSchemaToConnect)
tourSchema.virtual('reviews_Populated', {
  // ref: The model to be connected
  ref: 'Review',

  // foreignField: The "field name" in the schema of the connected model (ex: Model)
  foreignField: 'tour',

  // localField (for the tour id  current Tour model):
  localField: '_id',

  //  !!! and then need to use .populate method in tourController.js
  //  const tour = await Tour.findById(req.params.id).populate('reviews_Populated'); // to fill out "virtual" guide fields
});

tourSchema.virtual('reviews_Populated_Counter', {
  ref: 'Review',
  // foreignField: The "field name" in the schema of the connected model (ex: Model)
  foreignField: 'tour',
  // localField (for the tour id  current Tour model):
  localField: '_id',

  //By enabling this count property, the reviews_Populated_counter virtual property delivers only the number of document counts
  count: true // And only get the number of docs
});


tourSchema.virtual('reviews', {
  // ref: The model to be connected
  ref: 'Review',

  // foreignField: The "field name" in the schema of the connected model (ex: Model)
  foreignField: 'tour',

  // localField (for the tour id  current Tour model):
  localField: '_id',

  //  !!! and then need to use .populate method in tourController.js
  //  const tour = await Tour.findById(req.params.id).populate('reviews_Populated'); // to fill out "virtual" guide fields
});


// ====  pre-middleware (or pre-save hook) runs before .save() , create() command ===

// = create slug for data from its data name property =
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


// = create embedded data for guides =
tourSchema.pre('save',
  //the second parameter is a function and its  parameter "next" is for the default next() function
  async function(next) {

    // const guides = this.guides.map(id => User.findById(id));
    // rewrite this to async/await Function as beloiw

    // #1 async/await function will be returned as element for the Array
    // #2 read IDs from guides Array and pass the ID to User.findById(id) qeuery
    // to turn the id in Array into User document
    const guidesPromises = this.guides.map(async id => await User.findById(id));

    //this.guides is Array based on the schema
    this.guides = await Promise.all(guidesPromises);

    next();
  });



// //second .pre middleware
// tourSchema.pre('save', function(next) {
//   console.log(`\nNow save document...\n`);
//   next();
// });

// //post-middleware runs after .save() , create() command
// tourSchema.post('save', function(doc, next) {
//   console.log("\nThe post-middleware for doc after the pre-middleware\n");
//   console.log(doc);
//   console.log('\n');
//   next();
// });


// Query Middleware : process Query data "BEFORE" send data to client
//ref:  https://mongoosejs.com/docs/middleware.html#post

// 原本的方式 tourSchema.pre('find', function(next) {
// RegExp /^find/ 執行任何 含有開頭字串 'find' 的method ex: findOne ref: https://mongoosejs.com/docs/api/query.html
tourSchema.pre(/^find/, function(next) {
  //限制資料範圍，secretTour的等於true的話就不顯示(excluded)
  this.find({
    //this. points to the Query obj
    secretTour: {
      $ne: true
    }
  });

  //add start time stamp to measure request time
  this.start = Date.now(); // created a .start property to this.
  next();
});


// tourSchema.virtual('guides', {
//   // ref: The model to be connected
//   ref: 'Review',
//   // foreignField: The "field name" in the schema of the connected model (ex: Model)
//   foreignField: 'tour',
//   // localField (for the tour id  current Tour model):
//   localField: '_id',
//   //  !!! and then need to use .populate method in tourController.js
//   //  const tour = await Tour.findById(req.params.id).populate('reviews_Populated'); // to fill out "virtual" guide fields
// });


//
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });

  next();
});

// Query Middleware : process Query data "AFTER" send data to client
tourSchema.post(/^find/, function(docs, next) {
  //culcalate and show how much time passed from creating a .pre middleware to finish
  // console.log(`\nThe Query took ${Date.now() - this.start} milliseconds!\n`);
  // console.log(docs);
  next();
});





// //AGGREGATION PRE-MIDDLEWARE
// tourSchema.pre('aggregate', function(next) {
//
//   // 將 pipeline method (Array)的內容加入 篩選的 $match 物件， 限制輸出特定內容
//   // 效果同等於 tourSchema.pre(/^find
//   this.pipeline().unshift({
//     $match: {
//       secretTour: {
//         $ne: true
//       }
//     }
//   });
//   // console.log(this); //show the aggregation's pipeline property
//   console.log(`\nThe .pre of aggregation's method .pipeline() : \n`);
//   console.log(this.pipeline()); //show the aggregation's pipeline property
//
//   next();
// });

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
