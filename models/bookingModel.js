/*jshint esversion: 6 */
/*jshint esversion: 8 */
const path = require('path');
const scriptName = path.basename(__filename);
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const Tour = require('./tourModel');
// const Review = require('./reviewModel');

//Create a class-like "Schema" to descript the data
const Schema = mongoose.Schema;
//mongoosejs.com/docs/guide.html#models

//To create data has references linked to parent (Tour) schema
const bookingSchema = new Schema({
  tour: {
    //refer to parent schema
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour!']
  },
  user: {
    //refer to parent schema
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a User!']
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price!']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  paid: {
    type: Boolean,
    default: true,
  }
});


// ==== Pre-Middlewares ====

// populate the "user" field for every document queried with "find" method
bookingSchema.pre(/^find/, function(next) {

  // // console.log('\n === this :=== \n');
  // console.log(this);
  //
  // console.log('\n === req.user :=== \n');
  // console.log(req.user);

  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });

  next();

});


const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;







//
