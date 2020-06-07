/*jshint esversion: 6 */
/*jshint esversion: 8 */
const path = require('path');
// const dotenv = require('dotenv');
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
      select: false, // won't be shown in results
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        //This works only on create and save
        validator: function(el) {
          return this.password === el;
        },
        message: 'Passwords are not the same!',
      }
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

// https://mongoosejs.com/docs/middleware.html#pre
userSchema.pre('save', async function(next) {

  //This if statement with the next() runs only when the password property is modified
  //this.isModified is a method from Model itself that returns boolean when doc is is modified. argument is the name of property
  if (!this.isModified('password')) {
    return next();
  }

  //salt = random string // https://www.npmjs.com/package/bcryptjs
  // .hash method return a async Promise so use this whole callback as async
  this.password = await bcrypt.hash(this.password, 12); // hash the password with cost of 12

  //delete the value of passwordConfirm property
  this.passwordConfirm = undefined;

  next();

});

const User = mongoose.model('User', userSchema);

module.exports = User;
