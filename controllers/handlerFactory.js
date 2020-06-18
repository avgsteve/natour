/*jshint esversion: 6 */
/*jshint esversion: 8 */
/*jshint esversion: 9 */

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError'); // appError.js



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
