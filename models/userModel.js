/*jshint esversion: 6 */
/*jshint esversion: 8 */
const path = require('path');
const scriptName = path.basename(__filename);
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    // schema options ref:
    // https://mongoosejs.com/docs/guide.html#definition
    name: {
      type: String,
      required: [
        true,
        'Please let us know your name!'
      ]
    },
    email: {
      type: String,
      required: [
        true,
        'Please let us know your name!'
      ],
      unique: true,
      lowercase: true, //For example, if you want to lowercase a string before saving:
      validate: [validator.isEmail],
    },
    photo: String, // path
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      maxlength: 12,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
    },
  },
  // //the second parameter (obj) is schema options
  // {
  //   toJSON: {
  //     virtuals: true
  //   },
  //   toObject: {
  //     virtuals: true
  //   },
  // }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
