/*jshint esversion: 6 */
/*jshint esversion: 8 */
//review / rating / createdAt / ref to tour / ref to user

const mongoose = require('mongoose');

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


//static statics
reviewSchema.statics.calcAverageRatings = async function(tourId) {
  //"this" is current model
  const stats = await this.aggregate([
    //first stage
    {
      $match: {
        tour: tourId
      }
    },
    //
    {
      group: {
        _id: '$tour',
        nRating: {
          $sum: 1
        },
        avgRating: {
          $avg: '$rating'
        }
      }
    },
  ]);

};

reviewSchema.pre('save', function(next) {
  // "this" points to current review

  // "this.tour" is the current tour Id to be passed in
  // Review.calcAverageRatings(this.tour);
  this.construct.calcAverageRatings(this.tour);

  next();
});


const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;








//
