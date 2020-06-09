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
    passwordChangedAt: Date,
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

//
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {

  //candidatePassword is the raw password (not signed or not encrypted) from req.body
  //userPassword is the encrypted password from query (query.findOne) result
  return await bcrypt.compare(candidatePassword, userPassword); //will return boolean

  //Due to the field

  // ref for creating new prototype method:
  // https://mongoosejs.com/docs/api/schema.html#schema_Schema-method
};

//
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {

  // if the property passwordChangedAt: Date exists, then do the comparison
  if (this.passwordChangedAt) {

    //changedTimeStamp is created or updated after password is changed
    const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000,
      10 //base10 number
    );

    console.log('\nThe log in changedPasswordAfter\n');
    console.log(changedTimeStamp, JWTTimestamp);

    //if the JWTTimestamp (time stamp when token is created) is earlier than changedTimeStamp means password is changed
    return JWTTimestamp < changedTimeStamp;
  }

  return false; // means password is not changed
};



const User = mongoose.model('User', userSchema);

module.exports = User;
