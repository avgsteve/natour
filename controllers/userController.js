/*jshint esversion: 6 */
/*jshint esversion: 8 */
const User = require('./../models/userModel');
const APIFeatures = require('./../utils/apiFeatures'); // using class APIFeatures
const catchAsync = require('./../utils/catchAsync'); // using function catchAsync
const AppError = require('./../utils/appError'); // using function catchAsync
const factory = require('./handlerFactory'); //exports.deleteOne = Model => catchAsync(async (req, res, next) => { ...


const filterObj = (obj, ...allowedFields) => {
  // in function: exports.updateMe , const filteredBody = filterObj(req.body, 'name', 'email');
  const newObj = {};

  Object.keys(obj).forEach(propertyInObj => {
    //Object.keys(object1) return an array of all object's property names (as propertyInObj)

    //If the propertyInObj is included the allowedFields array , ex: 'name' , 'email'
    if (allowedFields.includes(propertyInObj)) {
      //allowedFields is array: ['name', 'email']

      //Then assign the obj's property and value that has been "filtered" to newObj object
      newObj[propertyInObj] = obj[propertyInObj];
    }

  });

  return newObj;
};

//
// 2) ============== ROUTE-HANDLERS
exports.getAllUsers = catchAsync(async (req, res, next) => {

  const users = await User.find();
  /*password field is set not to be shown in userModel.js:
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    maxlength: 12,
    select: false, // won't be shown in results
  },
  use:
  const users = await User.find();

*/

  // Send response
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users: users,
    },
  });

});

//for updating user's data except for password related fields
exports.updateMe = catchAsync(async (req, res, next) => {

  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates. Please use /updateMyPassword', 400));
  }

  // 2) Use function:  const filterObj = (obj, ...allowedFields) => { ... to filter out the fields that are not allowed to be updated
  // ...allowedFields is 'name', 'email'
  const filteredBody = filterObj(req.body, 'name', 'email', 'photo');

  // 3) Update the user document : findByIdAndUpdate(id, Obj for data, Obj for options)
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,

    //ref:  https://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate
    //options: #1 runValidators: if true, runs update validators on this command. Update validators validate the update operation against the model's schema.
    //options: #2 new: bool - true to return the modified document rather than the original. defaults to false
    //will trigger the isNew property and userSchema.pre('save', function(next) { for process new document

    // Obj.keys and Array.includes
    // https://codepen.io/avgsteve/pen/XWXKrNz?editors=0011
  });

  //
  res.status(500).json({
    status: 'success',
    data: updatedUser
  });

});

exports.deleteMe = catchAsync(async (req, res, next) => {
  //find a user by id and set field: active to false
  await User.findByIdAndUpdate(req.user.id, {
    active: false
  });

  res.status(204).json({
    status: 'success',
    data: null
  });


});

exports.getUser = (req, res) => {
  // 500 Internal Server Error
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

exports.createUser = (req, res) => {
  // 500 Internal Server Error
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

//update user data from DB (via route:  router.route('/:id').patch(authController.protect, userController.updateMe))
exports.updateUser = factory.updateOne(User);

//delete user data from DB (via route:  route('/:id').delete(userController.deleteUser);)
exports.deleteUser = factory.deleteOne(User);
