/*jshint esversion: 6 */
/*jshint esversion: 8 */
/*jshint esversion: 9 */
const path = require('path');
const scriptName = path.basename(__filename);
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures'); // using class APIFeatures
const catchAsync = require('./../utils/catchAsync'); // using function catchAsync
const AppError = require('./../utils/appError'); // using function catchAsync



/* for testing purpose
// 1) ===== middleware functions
//// 將JSON檔案轉成物件(Obj)檔案格式
const tours = JSON.parse(
  // fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);
*/

// 2) ===== ROUTE-HANDLERS

// pre-filling the query objs before using next middleware (getAllTours)
exports.aliasTopTours = (req, res, next) => {

  // for touRoutes.js to handle the aliased URL router.route('/top-5-cheap') etc,....
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  //{ sort: '-ratingsAverage,price' }
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next(); // which is tourController.getAllTours
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  //log current file name and time from
  console.log(`\n(from ${scriptName}: ) The requested was made at ${req.requestTime}`);
  console.log("\x1b[93m", "\nThe req.query obj from the GET request:", "\x1b[0m\n");
  console.log(req.query);

  // ex: { difficulty: 'easy', duration: { gte: '5' } }

  // #2 ============  processing QUERY  ============

  //將URL 所傳入的不同的 req.query 次一層物件屬性，例如: req.query.duration , req.query.sort, req.query.fields , req.query.page, req.query.limit 所相對應的mongoose Query methods 改寫進 Class constructor 裡面的 method，
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate(); //To use APIfeatures. filter method

  // #2 ============  EXECUTE QUERY  ============

  // (before refactoring the code) const tourResults = await newQuery;
  const tourResults = await features.query;

  /*
      // get all current data from DB
      // const tours = await Tour.find(); //ref:  https://mongoosejs.com/docs/api.html#model_Model.find

      // // --- different ways of querying data
      // // // 1. monogoDB way
      // const tours = await Tour.find({
      //   duration: 5,
      //   difficulty: "easy",
      // });

      // this method has the same result as #1 monogoDB way


      // const queryWith_queryStr = await Tour.find(newQuery);

      // // // 2. mongooseB way
      // const tours = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy');
      // ref: https://mongoosejs.com/docs/api/query.html#query_Query-where
  */

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime, //from app.js => req.requestTime = new Date().toISOString();
    results: tourResults.length,
    data: {
      tours: tourResults,
    }

  });
  /*
  } catch (error) {
    console.log("\nThere's an error in getAllTours() after GET request!: \n");
    console.log(error);
    //send error response with status code 400
    res.status(404).json({
      status: 'getting all data failed!',
      errorMessage: error,
    });
  }
*/

});

// 2-1) ROUTE-HANDLERS with " params from router.route('/:id') "
// ===> get only one result from Obj's "tours" array
exports.getTour = catchAsync(async (req, res, next) => {
  // req來自於 router.route('/:id').get(getTour)，params property key為 :id
  // to log the current req params from URI
  console.log(`\n(from ${scriptName}: ) The req.param is: `);
  console.log(req.params);
  //ex: 127.0.0.1:3000/api/v1/tours/5 的GET request 會顯示  "req.params": {"id": "5"}

  // get all current data from DB
  // const tour = await Tour.findById(req.params.id); //ref:  https://mongoosejs.com/docs/api.html#model_Model.find
  // Tour.findById(req.params.id) equals to the function Tour.findOne( {_id: req.param.id} )

  /* Change the code below to tourModels.js. The middleware:  tourSchema.pre(/^find/, function(next) {  this.populate
    // const tour = await Tour.findById(req.params.id).populate({
    //   path: 'guides',
    //   select: '-__v -passwordChangedAt'
    // }); // to fill out guide fields
  */

  // const tour = await Tour.findById(req.params.id).populate('guides'); // to fill out guide fields

  // get query from Tour model with findById method
  // and populate the Virtual property set in tourModels.js (in section: tourSchema.virtual('reviews_populated', )
  const tour = await Tour.findById(req.params.id).populate('reviews_populated'); // to fill out "virtual" guide fields

  console.log(`\n== From the Tour.findById function in tourControllers.js, the req.body is: \n${req.body}`);

  //ref for .populate('virtualPropName'):  https://mongoosejs.com/docs/populate.html#doc-not-found

  if (!tour) {
    //return new AppError for customized Error and terminate function right
    return next(new AppError(`No tour found with this tour id: ${req.params.id}`, 404));
  }


  res.status(200).json({
    status: 'success',
    inputs: {
      'req.params': req.params,
      'numberOfResults': "1",
      // 'tour': tour,
    },
    data: tour,
  });
  /*
  } catch (error) {
    console.log("\nThere's an error in getTour() after GET request!: \n");
    console.log(error);
    //send error response with status code 400
    res.status(404).json({
      status: 'getting the required data failed!',
      errorMessage: error,
    });
  }  */

  //在tours Array 裡面搜尋有key: id跟req.params相符內容，並透過find傳回整個符合條件的 Array
  // const tour = tours.find(el => el.id === +req.params.id); //req.params.id前的+號是coersion為數值


});


// Use catchAsync reaplce the repeated try ... catch ... block in the async functions
// ex: exports.createTour = catchAsync( (req, res) => {} );
exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });

});




// ===> (previous version) create new data from POST request
exports.createTour2 = catchAsync(async (req, res, next) => {
  //因為下面新增方法二的 Tour(model).create() function會傳回Promise，所以就要改用 async .. await funtion 的方式來使用 createTour function

  console.log(`\n=== (from ${scriptName}: ) POST request received!The req.body have the value as below: `);
  console.log(req.body);

  /* // ===建立資料的方法一 : new Model() & save()
  // // create new data from "document" class
  // const newTour = new Tour({});
  // newTour.save();
 https://mongoosejs.com/docs/api.html#document_Document-save
  If save is successful, the returned promise will fulfill with the document saved.
*/

  /* // ===建立資料的方法二  await model.create(req.body)
  // create new data from "model" class
  // ref: https://mongoosejs.com/docs/models.html
  // Models are fancy constructors compiled from Schema definitions. An instance of a model is called a document. Models are responsible for creating and reading documents from the underlying MongoDB database.
*/

  const newTour = await Tour.create(req.body);
  /* //model.create() is a Shortcut for saving one or more documents to the database.
    //MyModel.create(docs) does new MyModel(doc).save() for every doc in docs.
    //Returns:  «Promise»
    //ref:  https://mongoosejs.com/docs/api.html#model_Model.create
*/

  res.status(201).json({
    status: 'successfully added new data to DB',
    data: {
      tour: newTour, //send back the successfully created data to browser
    }
  });
  /*
    } catch (error) {
      console.log("\nThere's an error in createTour() after POST request!: \n");
      console.log(error);
      //send error response with status code 400
      res.status(400).json({
        status: 'adding new data failed!',
        errorMessage: error,
      });
    }
  */
});

// ===> updateTour
exports.updateTour = catchAsync(async (req, res, next) => {
  //在tours Array 裡面搜尋有key: id跟req.params相符內容，並透過find傳回整個符合條件的 Array
  // exports.tour = tours.find(el => el.id === +req.params.id); //req.params.id前的+號是coersion為數值

  console.log(`\nupdating data with the id "${req.params.id}" & req body:`);
  console.log(req.body);

  const updatedData = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true, //if true, runs update validators on this command. Update validators validate the update operation against the model's schema.
  });
  //ref:  https://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate  --> Model.findByIdAndUpdate('id', UpdateContentObj, optionsObj)

  if (!updatedData) {
    //return new AppError for customized Error and terminate function right
    return next(new AppError(`No tour found with this tour id: ${req.params.id}`, 404));
  }



  res.status(200).json({
    status: "success",
    message: "data is successfully updated!",
    data: {
      // tour: 'updated content here...',
      tour: updatedData,
    }
  });

  /*
    } catch (error) {
      console.log("\nThere's an error in updateTour() after PATCH request!: \n");
      console.log(error);
      //send error response with status code 400
      res.status(404).json({
        status: 'Updating the data has failed!',
        errorMessage: error,
      });
    }
  */
});

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
  /*
    // } catch (err) {
    //   console.log("\nThere's an error in deleteTour() after DELETE request!: \n");
    //   console.log(error);
    //   //send error response with status code 400
    //   res.status(404).json({
    //     status: 'delete new data failed!',
    //     errorMessage: error,
    //   });
    //
    // }  */
});

//101. Aggregation Pipeline: Matching and Grouping
exports.getTourStats = catchAsync(async (req, res, next) => {

  const stats = await Tour.aggregate([
    // First Stage: The "$match stage" filters the documents by the status field and passes to the next stage those documents that have ratingAverage greater than 4.5
    {
      $match: {
        ratingAverage: {
          $gte: 4.5
        }
      }
    },
    // Second Stage: The "$group stage" groups the documents by the cust_id field to calculate the sum of the amount for each unique cust_id.

    {
      $group: {
        //accumalator
        // _id: null,
        // _id: '$ratingAverage', // will seperate the results into 3 difficulty groups
        //
        // _id: '$difficulty', // will seperate the results into 3 difficulty groups
        //
        numTours: {
          $sum: 1
        },
        _id: {
          $toUpper: '$difficulty'
        }, // will uppercase the title of 3 difficulty groups

        //calculate average rating
        aveRating: {
          $avg: '$ratingAverage' //ratingsAverage is the prop key
        },
        avePrice: {
          $avg: '$price' //price is the prop key
        },
        minPrice: {
          $min: '$price' //ratingsAverage is the prop key
        },
        maxPrice: {
          $max: '$price' //ratingsAverage is the prop key
        }
      }
    },
    {
      $sort: {
        //use field name from $group
        avgPrice: 1 // 1 means ascending
      }
    },
    {
      $match: {
        _id: {
          //$ne: not equal to. To exclude the results with the field _id: EASY
          $ne: 'EASY'
        }
      }
    },
  ]);

  //ref:  https://mongoosejs.com/docs/api/model.html#model_Model.aggregate
  //      https://docs.mongodb.com/manual/aggregation/

  res.status(200).json({
    status: 'getTourStats() is successful',
    requestedAt: req.requestTime, //from app.js => req.requestTime = new Date().toISOString();
    data: {
      dataLength: stats.length,
      aggregatedStats: stats,
    }

  });
  /*  } catch (errorMessage) {
      console.log(errorMessage);
    }  */
});


exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  // try {
  console.log(`From req.params.year in exports.getMonthlyPlan:\n${req.params.year}`);

  const year = +req.params.year;

  const plan = await Tour.aggregate([{
      $unwind: '$startDates',
    }, { // ==== stage #1
      $match: { //set time period
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        }
      }
    },
    { // ==== stage #2
      $group: {
        //set time period
        _id: // use expression. It's the '$startDates' used
        //  Pipeline Operators and Indexes
        //  https://docs.mongodb.com/manual/core/aggregation-pipeline/#pipeline-operators-and-indexes
        {
          $month: '$startDates' //then the _id will take on the number of each month
        },
        // field1
        numTourStarts: {
          $sum: 1
        },
        tour: {
          $push: '$name' // push name fields into the array
        }
      }
    },
    { // ==== #3 add customized fields
      $addFields: {
        month: '$_id'
      }
    },
    { // ==== stage #4 project to designated fields
      $project: {
        _id: 0, // zero value will hide the field from results
      }
    },
    { // ==== stage #5 sorting
      $sort: {
        // sort the results according to the designated field
        //
        numTourStarts: -1, // -1 value will sort results in descending order (start with highest number)
        // ------------
        // month: 1, // -1 value will sort results in descending order (start with highest number)

      }
    },
    { //==== stage #6 "limit" the number of results
      $limit: 12,
    },

  ]);

  var stats;

  res.status(200).json({
    status: 'getMonthlyPlan() is successful',
    requestedAt: req.requestTime, //from app.js => req.requestTime = new Date().toISOString();
    resultsCount: plan.length,
    data: {
      aggregatedMonthlyPlan: plan,
    }

  });
  /*
   } catch (error) {
     console.log(`There's an error in exports.getMonthlyPlan:\n`);
     console.log(error);

     res.status(404).json({
       status: 'fail',
       errorMessage: error,
     });
   } */
});


////// Check id middleware :  to make sure user entered the correct id. Export this function
// exports.checkID = (req, res, next, val) => {
//   console.log(`\n(From tourControllers.js, checkID middleware.) \nthe param for 'id' is: ${val}`);
//
//   //when the input in is not correct
//   if (+val > tours.length) {
//     console.log(`invalid id input from URL: ${val}`);
//
//     return res.status(404).json({
//       status: "fail",
//       message: "Invalid id",
//       incorrect_input: req.params,
//     });
//   }
//
//   next();
// };
