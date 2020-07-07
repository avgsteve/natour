/*jshint esversion: 6 */
/*jshint esversion: 8 */
const User = require('./../models/userModel');
const APIFeatures = require('./../utils/apiFeatures'); // using class APIFeatures
const catchAsync = require('./../utils/catchAsync'); // using function catchAsync
const AppError = require('./../utils/appError'); // using function catchAsync
const factory = require('./handlerFactory'); //exports.deleteOne = Model => catchAsync(async (req, res, next) => { ...
const sharp = require('sharp');
const multer = require('multer'); // https://www.npmjs.com/package/multer

// === configure multer package ====

// 1) configure the storage with multer
// //https://www.npmjs.com/package/multer#diskstorage

// // option A) save file directly to disk storage
// const multerStorage = multer.diskStorage({
//   // a) use callback to set up folder path
//   destination: (req, file, callback) => {
//     callback(null, 'public/img/users');
//   },
//   // b) Formatting file name based on user id etc,. Like user-45345jiji-timeStamp.jpeg
//   filename: (req, file, callback) => {
//     // get the "extension name" from the incoming file
//     const fileExtension = file.mimetype.split('/')[1];
//     // Put user id, time stamp and extension name together
//     callback(null, `user-${req.user.id}-${Date.now()}.${fileExtension}`);
//   }
// });

// // option B) save file directly to memory storage
const multerStorage = multer.memoryStorage();

// 2) To verify if uploaded file is image. Returns Boolean. ref:  https://www.npmjs.com/package/multer#filefilter
const multerFilter = (req, file, callback) => {

  if (file.mimetype.startsWith('image')) {
    callback(null, true);
  } else {
    callback(
      new AppError('Not an image! Please uploading only images.', 400),
      false);
  }
};

// 3) Set option for multer. Ex: "storage" for destination folder path
// and file filter
const upload = multer({
  // // (Not in use)alternative config for file path:
  // dest: 'public/img/users',

  // use storage obj to config
  storage: multerStorage,
  fileFilter: multerFilter,
});

// 4) export multer package with config for router:
// router.patch('/updateMe', userController.uploadUserPhoto, userController.updateMe);
exports.uploadUserPhoto = upload.single('photo');
// upload.single('name of the field in the form for uploading file')


/* // === Important Note for req.file and req.file.buffer objects === //:

// #1 The update Object's method "upload.single('photo')" will store the file in "req.file"
// ref:  https://github.com/expressjs/multer#singlefieldname

// #2 In multer({ }), when it takes argument obj as option has the "storage" option, the file in "req.file" will be turned into Buffer obj. And the Buffer obj will be in "req.file.buffer" for the next middleware to use or process.

// ref 1): (In req.file) The key ".buffer" is a Buffer of the entire file	//ref source: https://www.npmjs.com/package/multer#api

// ref 2): When using memory storage, the file info will contain a field called buffer that contains the entire file.  //ref source: https://www.npmjs.com/package/multer#memorystorage
*/

// Resize user's photo upon uploading it
exports.resizeUserPhoto = (req, res, next) => {
  // 1) first check if there's any uploaded file
  if (!req.file) return next();

  // 2) Change the value for the key ".filename" in req.file obj
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  // 3) save file to memory first instead of disk. This will make it return a Buffer obj due to the setting: const multerStorage = multer.memoryStorage()
  // // ref:  https://www.npmjs.com/package/multer#memorystorage
  sharp(req.file.buffer)
    // resize(width, height)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({
      quality: 90
    })
    .toFile(`public/img/users/${req.file.filename}`);
  // ref: https://sharp.pixelplumbing.com/api-resize#parameters

  next();
};

//Obj for filtering fields that are input from the keys in req.body obj
const filterObj = (obj, ...allowedFields) => {
  // in function: exports.updateMe , const objWithFilteredKeys = filterObj(req.body, 'name', 'email');
  const newObj = {};

  Object.keys(obj).forEach(allowedKeyForValue => {
    //Object.keys(object1) return an array of all object's property names (as allowedKeyForValue)

    //If the allowedKeyForValue is included the allowedFields ARRAY , ex: 'name' , 'email'
    if (allowedFields.includes(allowedKeyForValue)) {
      //allowedFields is array: ['name', 'email']

      //Then assign the obj's property and value that has been "filtered" to newObj object
      newObj[allowedKeyForValue] = obj[allowedKeyForValue];
    }

  });

  return newObj;
};

//
// 2) ============== ROUTE-HANDLERS ==============

//
exports.getAllUsers = factory.getAll(User);
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

//
exports.getMe = (req, res, next) => {
  // Get req.user.id property from previous middle ware (authController.protect) from the route controller.catch.
  // Then assign req.user.id to req.params.id to give req.params.id and new property which is going to be used in next middl ware funcion (userController.getUser)
  req.params.id = req.user.id;
  next();
};

// for updating user's data except for password related fields
// function is used by router.patch('/updateMe', userController.updateMe); in routes/userRoutes.js
// and used by js/updateSettings.js
exports.updateMe = catchAsync(async (req, res, next) => {

  console.log("\x1b[32m" + "\n-- The req.body for updating user from \n  with updateSettings.js using API (PATCH request): \n" + "\x1b[0m");
  console.log("  (function location: userController.updateMe used by routes/viewRoutes.js)\n");
  console.log(req.body);

  // for file uploading
  if (req.file) {
    console.log("\x1b[32m" + "\n  -- The req.file for uploading file\n" + "\x1b[0m");
    console.log(req.file);
    console.log("\x1b[32m" + "\n\n" + "\x1b[0m");
    /* the log example:
      {
        fieldname: 'photo',
        originalname: 'default - Copy.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: 'public/img/users',
        filename: 'cdefddfaef9231c10511d70a0ea20bfb',
        path: 'public\\img\\users\\cdefddfaef9231c10511d70a0ea20bfb',
        size: 14088
      }
    */

  }

  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates. Please use /updateMyPassword', 400));
  }

  // 2) Use function:  const filterObj = (obj, ...allowedFields) to modify req.body obj
  // to make req.body obj has only allowed keys. So user can update data with only allowed fields
  const objWithFilteredKeys = filterObj(req.body, 'name', 'email', 'photo');

  // // 2-1) Add a "photo" property to objWithFilteredKeys obj with assigned value from req.file.filename to update "photo" fields' value
  // // req.file.filename
  if (req.file) objWithFilteredKeys.photo = req.file.filename;

  // 3) Update the user document : findByIdAndUpdate(id, Obj for data, Obj for options)
  const updatedUser = await User.findByIdAndUpdate(req.user.id, objWithFilteredKeys, {
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
  res.status(200).json({
    status: 'success',
    message: 'The user\'s data has been updated by PATCH req with userController.updateMe in userRoutes.js',
    data: updatedUser
  });

  console.log("\n -- res.locals:");
  console.log(res.locals);

  console.log("\n -- res.message:");
  console.log(res.locals);

  console.log("\n" + "\x1b[32m" + "-- End of the log for updating user from form (class='form-user-data') : \n" + "\x1b[0m");

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

//route middle ware for SINGLE user route, ex: router.route('/:id').get(userController.getUser)
exports.getUser = factory.getOne(User);

exports.createUser = (req, res) => {
  // 500 Internal Server Error
  res.status(500).json({
    status: 'error',
    message: 'This route /createUser is not yet defined! Please use /signup instead!'
  });
};

//update user data from DB (via route:  router.route('/:id').patch(authController.protect, userController.updateMe))
exports.updateUser = factory.updateOne(User);

//delete user data from DB (via route:  route('/:id').delete(userController.deleteUser);)
exports.deleteUser = factory.deleteOne(User);
