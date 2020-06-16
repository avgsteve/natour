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
	//the second parameter (obj) is schema options
	{
		toJSON: {
			virtuals: true
		},
		toObject: {
			virtuals: true
		},
	}
})


const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;








//