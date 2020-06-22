/*jshint esversion: 6 */
/*jshint esversion: 8 */
//review / rating / createdAt / ref to tour / ref to user

const mongoose = require('mongoose');
const Tour = require('./tourModel');
const AppError = require('.././utils/appError'); // appError.js


const reviewSchema = new mongoose.Schema({
    review: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.']
    },
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

//
reviewSchema.index({
  tour: 1,
  user: 1
}, {
  unique: true
}); // In natours.reviews' indexes tab in MongoDB Compass, will show tour_1_user_1 index.


//populate schema's field inside current incoming Query by using .pre middleware
reviewSchema.pre(/^find/, function(next) {
  //
  // populate({ path: currentSchemaField , select: selected targetId's field })

  // this.populate({
  //     path: 'tour',
  //     // select only the name field of the tour data
  //     select: 'name'
  //   })
  //

  //

  // this.populate({
  //   path: 'user',
  //   // select only name and photo fields to display
  //   select: 'name photo'
  // });

  // 下面的populdate path tour會讓底下的 reviewSchema.post(/^findOneAnd/, async function() { 程式碼出錯
  // this.populate({
  //   path: 'tour',
  //   // select only name and photo fields to display
  // });

  this.populate({
    path: 'user',
    // select only name and photo fields to display
    select: 'name photo'
  }).populate({
    path: 'tour',
    // select only name and photo fields to display
    select: 'name'
  });

  //ex:
  //   "user": {
  //     "_id": "5c8a23c82f8fb814b56fa18d",
  //     "name": "Laura Wilson",
  //     "photo": "user-14.jpg"
  // },

  ////
  // console.log(`\n=== Log for "this" in reviewSchema.pre(/^find/, function(next) { ===\n'`);
  // console.log(this);
  next();
});


// In model Schema, create a static functions which can be used in Query obj later on
//ref:  https://mongoosejs.com/docs/guide.html#statics
reviewSchema.statics.calcAverageRatings = async function(tourId) {

  // Create aggregated data (for the statistic data) and "this" will be Query obj when user query data with this reviewSchema
  const stats = await this.aggregate([
    //first stage: $match. Find out all results with the matched id in tour fields
    {
      $match: {
        tour: tourId
      }
    },
    //second stage: group by field (tour)
    {
      $group: {
        //group results by field: "tour"
        _id: '$tour',
        //creat a field in result called "nRating" for the number of ratings
        nRating: {
          //Returns a sum of numerical values. Ignores non-numeric values.
          //https://docs.mongodb.com/manual/reference/operator/aggregation/sum/#grp._S_sum
          $sum: 1
        },
        //creat a field in result called "avgRating" for the average of ratings
        avgRating: {
          //Returns the average value of the numeric values. $avg ignores non-numeric values.
          $avg: '$rating'
        }
      }
    }
    // ref:  https://mongoosejs.com/docs/api.html#model_Model.aggregate
    // ref:  https://docs.mongodb.com/manual/aggregation/

  ]);

  //Log stats to see the aggregated statistic data updated with the lastest result
  console.log("\n\n---'stats' in reviewSchema.statics.calcAverageRatings():\n");
  console.log(stats); //ex: results:   [ { _id: 5eee23531daf5a7350af0e1f, nRating: 16, avgRating: 4.4375 } ]

  // Find a doc with Tour model and update the doc's ratingsQuantity and ratingsAverage property with aggregated data (this)
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });

    //when there's no more review for this Tour doc and the method findByIdAndUpdate returns empty array:
  } else {
    // set the properties to default value
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });

    // next(new AppError(`Can't find ${ } on this server!`, 404));
  }


};

// ===== MIDDDLE WARES for aggregating document's review data when saving, updating and deleting FOR ANY REVIEWS =====

//Use Query post middle ware to update the Tour data
//with lastest aggregation data from static method "calcAverageRatings" after the document is saved to db
reviewSchema.post('save', function(next) {
  // "this" points to current review document is being saved

  // "this.tour" is the current tour Id to be passed in
  // Review.calcAverageRatings(this.tour);
  this.constructor.calcAverageRatings(this.tour);
});


// findByIdAndUpdate (equals to findOneAndUpdate)
// findByIdAndDelete (equals to findOneAndDelete)

//use .pre middleware to get doc from Query and then assign doc to .reviewDoc property for .post middleware to use
reviewSchema.pre(/^findOneAnd/, async function(next) {
  // console.log('\n"This" before "await this.findOne();"\n');
  // console.log(this);

  //"this" means the Query obj. See compareAfter.js and the viewDoc property in compareBefore.js for comparison
  this.reviewDoc = await this.findOne();

  // console.log('\n"This" AFTER "await this.findOne();"\n');
  // console.log(this);

  console.log("\n\n--- 'this.reviewDoc' in reviewSchema.pre(/^findOneAnd/,:\n");
  console.log(this.reviewDoc);
  next();
});

//
reviewSchema.post(/^findOneAnd/, async function() {
  // await this.findOne() doesn't work here as it was executed previously in function :
  //reviewSchema.pre(/^findOneAnd/,
  await this.reviewDoc.constructor.calcAverageRatings(this.reviewDoc.tour._id);

});

// //
// reviewSchema.post(/^findOneAnd/, async function() {
//   // await this.findOne(); does NOT work here, query has already executed
//   await this.r.constructor.calcAverageRatings(this.r.tour);
// });

//
// reviewSchema.pre(/^findOneAnd/, async function(next) {
//   this.r = await this.findOne();
//   // console.log(this.r);
//   next();
// });
//
// reviewSchema.post(/^findOneAnd/, async function() {
//   // await this.findOne(); does NOT work here, query has already executed
//   await this.r.constructor.calcAverageRatings(this.r.tour);
// });
//

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;





//
