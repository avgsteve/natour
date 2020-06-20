/*jshint esversion: 6 */
/*jshint esversion: 8 */
//review / rating / createdAt / ref to tour / ref to user

const mongoose = require('mongoose');
const Tour = require('./tourModel');

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

//populate schema's field inside current incoming Query by using .pre middleware
reviewSchema.pre(/^find/, function(next) {
  this
    // populate({ path: currentSchemaField , select: selected targetId's field })
    .populate({
      path: 'tour',
      // select only the name field of the tour data
      select: 'name'
    })
    //
    .populate({
      path: 'user',
      // select only name and photo fields to display
      select: 'name photo'
    });

  next();
});


// add static functions to model (to be create from reviewSchema)
//ref:  https://mongoosejs.com/docs/guide.html#statics
reviewSchema.statics.calcAverageRatings = async function(tourId) {

  // Create aggregated data and "this" is current model (Review)
  // https://mongoosejs.com/docs/api.html#model_Model.aggregate
  // https://docs.mongodb.com/manual/aggregation/
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
        //
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
    },
  ]);

  console.log("\nstats:\n");
  console.log(stats); //ex: results:   [ { _id: 5eee23531daf5a7350af0e1f, nRating: 16, avgRating: 4.4375 } ]


  //====
  if (stats.length > 0) {

    // await Model.staticFunction
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }

};

reviewSchema.post('save', function(next) {
  // "this" points to current review document is being saved

  // "this.tour" is the current tour Id to be passed in
  // Review.calcAverageRatings(this.tour);
  this.constructor.calcAverageRatings(this.tour);
});


const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;








//
