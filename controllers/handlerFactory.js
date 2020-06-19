/*jshint esversion: 6 */
/*jshint esversion: 8 */
/*jshint esversion: 9 */

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError'); // appError.js
const APIFeatures = require('./../utils/apiFeatures'); // using class APIFeatures
var path = require('path');
const scriptName = path.basename(__filename);

//delete tour or users by receiving Model obj and return whole async/await function to the caller function
exports.deleteOne = Model => catchAsync(async (req, res, next) => {

  //
  const doc = await Model.findByIdAndDelete(req.params.id);

  if (!doc) {
    return next(new AppError('No document found with this ID', 404));
  }


  res.status(204).json({
    status: 'success',
    data: null
  });
});


//update tour or users by receiving Model obj and return whole async/await function to the caller function
exports.updateOne = Model => catchAsync(async (req, res, next) => {

  console.log(`\n== From the updateOne function module in handlerFactory.js, the "req.body" is: \n`);
  console.log(req.body);

  // find data by Id and update from req.body
  const updatedData = await Model.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true, //if true, runs update validators on this command. Update validators validate the update operation against the model's schema.
  });
  //ref:  https://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate  --> Model.findByIdAndUpdate('id', UpdateContentObj, optionsObj)

  if (!updatedData) {
    return next(new AppError('No document found with this ID', 404));
  }


  res.status(200).json({
    status: 'data successfully updated!',
    data: {
      dataHandledBy: "handlerFactory(.js).updateOne",
      data: updatedData
    }
  });
});


exports.createOne = Model => catchAsync(async (req, res, next) => {

    // find data by Id and update from req.body
    const createdData = await Model.create(req.body);

    //ref:  https://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate  --> Model.findByIdAndUpdate('id', UpdateContentObj, optionsObj)

    res.status(201).json({
      status: 'data successfully created!',
      data: {
        dataHandledBy: "handlerFactory(.js).createOne",
        data: createdData
      }
    });
  }

);

/*

//// ===> deleteTour
exports.deleteTour = catchAsync(async (req, res, next) => {
  // try {
  console.log('\n===== req.param for DELETE request is:');
  console.log(req.params);

  const deleteTour = await Tour.findByIdAndDelete(req.params.id);
  //https://mongoosejs.com/docs/api.html#model_Model.findByIdAndDelete

  //If used invalid id, then will get null from deleteTour
  if (!deleteTour) {
    //return new AppError for customized Error and terminate function right
    return next(new AppError(`No tour found with this tour id: ${req.params.id}`, 404));
  }


  // status 204 will not send out data to browser , only the status code 204
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

*/


//
exports.getOne = (Model, populateOptions) => catchAsync(async (req, res, next) => {

  // get query from Tour model with findById method
  // and populate the Virtual property set in tourModels.js (in section: tourSchema.virtual('reviews_populated', )
  // // below was the original code for document with populated virtual fields
  // const doc = await Model.findById(req.params.id).populate('reviews_populated_counter').populate('reviews_populated'); // to fill out "virtual" guide fields

  // // Then reorganize the code as below:
  let query = Model.findById(req.params.id);

  // if (populateOptions.length > 0) {
  //   query = populateOptions.forEach(itemIn_populateOptions => query.populate(itemIn_populateOptions));
  // }

  // for the Model with virtual fields to be populated
  if (populateOptions) {
    // ex: (in tourController.js)
    // exports.getTour = factory.getOne(Tour, {
    //   path: 'reviews_populated reviews_populated_counter'
    // });

    // (in this current file: handlerFactory.js)
    // console.log(populateOptions); // {path: 'reviews_populated reviews_populated_counter'}
    query = query.populate(populateOptions);
  }

  const doc = await query;

  console.log(`\n\n== From the getOne function module in handlerFactory.js, the "populateOptions": \n`);
  if (populateOptions) {
    console.log(populateOptions);
  } else {
    console.log('The argument for parameter "populateOptions" is not provided.\n');
  }


  //ref for .populate('virtualPropName'):  https://mongoosejs.com/docs/populate.html#doc-not-found

  if (!doc) {
    //return new AppError for customized Error and terminate function right
    return next(new AppError(`No document found with this Id: ${req.params.id}`, 404));
  }


  res.status(200).json({
    status: 'successfully get one document from DB',
    // inputs: {
    //   // 'req.params': req.params,
    //   // 'tour': tour,
    // },
    data: doc,
  });
});

exports.getAll = Model => catchAsync(async (req, res, next) => {
  //log current file name and time from
  console.log(`\n(from ${scriptName}: ) The requested was made at ${req.requestTime}`);
  console.log("\x1b[93m", "\nThe req.query obj from the GET request:", "\x1b[0m\n");
  console.log(req.query);


  // #1 ============  GET QUERY  ============
  // According to the property from req.query that is passed in from URL query, ex: req.query.duration (?duration=1) , req.query.sort, req.query.fields , req.query.page, req.query.limit , use correspoding mongoose Query methods in APIFeatures Class.

  const features = new APIFeatures(Model.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate(); //To use APIfeatures. filter method

  // #2 ============  EXECUTE QUERY  ============
  // (before refactoring the code) const tourResults = await newQuery;
  const doc = await features.query;

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime, //from app.js => req.requestTime = new Date().toISOString();
    results: doc.length,
    data: {
      tours: doc,
    }
  });

});
