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
  //populateOptions ex:  {  path: 'reviews_populated reviews_populated_counter'}

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

exports.getAll = (Model, populateOptions) => catchAsync(async (req, res, next) => {
  //log current file name and time from
  console.log(`\n(from ${scriptName}: ) The requested was made at ${req.requestTime}`);
  console.log("\x1b[93m", "\nThe req.query obj from the GET request:", "\x1b[0m\n");
  console.log(req.query);


  // #0 ==== small hack of getting a "filter" from nested URL for REVIEW Query obj ====
  // the filter obj to be used as in Review.find(filter) to get reviews for certain "tour" documents
  let filter = {};

  /* Get params from the nested URL: ex: http://host/api/v1/tours/:tourId/reviews

  If there's property req.params.tourId
  from router.use('/:tourId/reviews', reviewRouter) in touRoutes.js
  (which handles this part of URL: /api/v1/tours in app.use('/api/v1/tours', tourRouter);
 in app.js)

  and via the express.Router's option "mergeParams: true" in reviewRoutes.js,
  then we can get value from req.params.tourId in current file (reviewController.js) then assign the value to filter obj
*/
  if (req.params.tourId) filter = {
    tour: req.params.tourId,
    // // optional filters:
    // rating: {
    //   $gte: 4
    // },
  }; //example result from filter: { tour: '5ee78ffdc4ecd526f8f636e3' }

  // Find all documents that match selector. The result will be an array of documents.
  // await Query.prototype.find(filter, optional: callback)

  // #1 ============  GET QUERY  ============
  // According to the property from req.query that is passed in from URL query, ex: req.query.duration (?duration=1) , req.query.sort, req.query.fields , req.query.page, req.query.limit , use correspoding mongoose Query methods in APIFeatures Class.

  let features = new APIFeatures(Model.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate(); //To use APIfeatures. filter method


  // if (populateOptions) {
  //   features.query = features.query.populate(populateOptions);
  // }
  //

  //if (populateOptions) {
  //  query = query.populate(populateOptions);
  //}

  // console.log('features:\n');
  // console.log(features);

  // console.log(`\n\n== From the getOne function module in handlerFactory.js, the "populateOptions": \n`);
  // if (populateOptions) {
  //   console.log(populateOptions);
  // } else {
  //   console.log('The argument for parameter "populateOptions" is not provided.\n');
  // }


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
