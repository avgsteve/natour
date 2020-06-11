/*jshint esversion: 6 */
/*jshint esversion: 8 */
const path = require('path');
// const dotenv = require('dotenv');
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user'
    },
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
    passwordResetToken: String, // will be generated by userSchema.methods.createPasswordResetToken = function() {
    passwordResetExpires: Date
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


// will be called inside the middleware forgotPassword in authController.js
// as prototype chain method in the User schema and will be inherited by Query result due to prototype chain
userSchema.methods.createPasswordResetToken = function() {

  // generat (random) token string that will be used to reset password and turn to base10

  // const resetToken2 = crypto.randomBytes(32); //!!! not URL-friendly
  /*   const resetToken = crypto.randomBytes(32);  ==> logged content:
  {
  resetToken: <Buffer c5 ee 58 60 7e 06 9d bc ea c9 95 44 97 60 d6 90 a6 af 30 af c7 5e ca 05 17 10 42 9c 57 f6 e8 2a>
  }
  // resetToken.length: 32
  */

  //
  const resetToken = crypto.randomBytes(32).toString('hex'); //!!! URL-friendly string
  /*  const resetToken = crypto.randomBytes(32).toString('hex');  ==> logged content:
  {
    resetToken: 'fcf8452276541f5da5103ad9de7fb09feee19040eb01d54f986bc4d80dfa076f'
  }
  // resetToken.length: 64
  */

  // ref for crypto.randomBytes :
  // https://nodejs.org/api/crypto.html#crypto_crypto_randombytes_size_callback


  //================= PLAIN STRING FOR RESETTING PASSWORD =====================
  //assign(or say update) the hashed token to the field ".passwordResetToken " in schema field
  //and the value of property .passwordResetToken will be sent to user via email to reset password
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex'); // hashed token   ex: b1be70e2d5578161c4a602c45e5e1392b23729c15de4bf4289c418ece009c2da

  //ref:
  // #1: .createHash()     crypto.createHash(algorithm[, options])
  // Creates and returns a Hash object that can be used to generate hash digests using the given algorithm
  // https://nodejs.org/api/crypto.html#crypto_crypto_createhash_algorithm_options

  // #2: .update()         hash.update(data[, inputEncoding]) ):
  // Updates the hash content with the given data, the encoding of which is given in inputEncoding
  // https://nodejs.org/api/crypto.html#crypto_hash_update_data_inputencoding

  // #3: .digest()         hash.digest([encoding])
  // Calculates the digest of all of the data passed to be hashed (using the hash.update() method). If encoding is provided a string will be returned; otherwise a Buffer is returned.
  // https://nodejs.org/api/crypto.html#crypto_hash_digest_encoding


  console.log({ //use curly bracket to show variable name and value
      resetToken // (not hashed) { resetToken: 'a66c978cdf8d476488bb7a5e2f3223ca3fd52ac7115b3b1779a0ed7fb79cc576' }
    },
    resetToken.length, // 64
    // {
    //   resetToken2
    // },
    // resetToken2.length,
    this.passwordResetToken // (hashed with sha256) '54562e8a62656245dc270435c8b51343aee74310588cedac07da925442023179'
  );

  //adding the time stamp right at the moment the passwordResetToken is called (1000 milliseconds * 60 second * 10 minutes)
  this.passwordResetExpires = Date.now() + 1000 * 60 * 10;

  // return the reset token to the middleware function such as "forgotPassword"
  return resetToken;





};


const User = mongoose.model('User', userSchema);

module.exports = User;
