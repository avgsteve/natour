/*jshint esversion: 6 */
/*jshint esversion: 8 */
/*jshint esversion: 9 */
const path = require('path');
const scriptName = path.basename(__filename);
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync'); // using function catchAsync
const AppError = require('./../utils/appError'); // using function catchAsync
const factory = require('./handlerFactory'); //exports.deleteOne = Model => catchAsync(async (req, res, next) => {


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

exports.getAllTours = factory.getAll(Tour, {
  // path: 'guides',
  // select: '-__v -passwordChangedAt guides'
});


// 2-1) ROUTE-HANDLERS with " params from router.route('/:id') "
// ===> get only one result from Obj's "tours" array
// exports.getTour = factory.getOne(Tour);
exports.getTour = factory.getOne(Tour, {
  // path is used for the virtual fields that are going to be populated in results
  path: 'reviews_populated reviews_populated_counter'
});

// exports.getTour = factory.getOne(Tour, "reviews_populated_counter", "reviews_populated");
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

// Use catchAsync reaplce the repeated try ... catch ... block in the async functions
// ex: exports.createTour = catchAsync( (req, res) => {} );

exports.createTour = factory.createOne(Tour);


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
exports.updateTour = factory.updateOne(Tour);

//// ===> deleteTour
// pass the Tour model imported from tourModel.js
exports.deleteTour = factory.deleteOne(Tour);

//
//   exports.deleteTour = catchAsync(async (req, res, next) => {
//     // try {
//     console.log('\n===== req.param for DELETE request is:');
//     console.log(req.params);
//
//     const deleteTour = await Tour.findByIdAndDelete(req.params.id);
//     //https://mongoosejs.com/docs/api.html#model_Model.findByIdAndDelete
//
//     //If used invalid id, then will get null from deleteTour
//     if (!deleteTour) {
//       //return new AppError for customized Error and terminate function right
//       return next(new AppError(`No tour found with this tour id: ${req.params.id}`, 404));
//     }
//
//
//     // status 204 will not send out data to browser , only the status code 204
//     res.status(204).json({
//       status: 'success',
//       data: null,
//     });
//     /*
//       // } catch (err) {
//       //   console.log("\nThere's an error in deleteTour() after DELETE request!: \n");
//       //   console.log(error);
//       //   //send error response with status code 400
//       //   res.status(404).json({
//       //     status: 'delete new data failed!',
//       //     errorMessage: error,
//       //   });
//       //
//       // }  */
// });


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


// router.route('/tours-within/:distance/center/:latlng/unit/:unit', tourController.getToursWithin);
//     example:  /tours-distance/233/center/31.111745,-118.113491/unit/mi

exports.getToursWithin = catchAsync(async (req, res, next) => {

  const {
    distance,
    latlng,
    unit
  } = req.params;

  //the radius of earth is 3963.2 miles which equals to 6378.1 km
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; // ex: distance 200 miles / 3963.2 is ‭0.05046 from center point

  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    next(new AppError('Please provide longitude and latitude in the format lat,lng', 400));
  }

  console.log(distance, lat, lng, unit);

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [
          [lng, lat], radius
        ]
      }
    }
  });


  res.status(200).json({
    status: 'getToursWithin() is successful',
    requestedAt: req.requestTime, //from app.js => req.requestTime = new Date().toISOString();
    dataResultsCount: tours.length,
    dataFromReqParams: {
      distance,
      lat,
      lng,
      unit
    },
    data: tours,
  });


});


exports.getDistances = catchAsync(async (req, res, next) => {

  const {
    latlng,
    unit
  } = req.params;

  const [lat, lng] = latlng.split(',');

  const distanceUnit = unit === 'mi' ? 'distanceInMiles' : 'distanceInKilometers';

  //if unit is mi for miles , then multiply the default distance unit meter with 0.000621371
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;


  if (!lat || !lng) {
    next(new AppError('Please provide longitude and latitude in the format lat,lng', 400));
  }

  const distances = await Tour.aggregate([
    //$geoNear is always to be at the first stage
    //in tourModel.js tourSchema.pre('aggregate') ... will be the first stage in a pipeline as .pre middlw ware
    //therefore, need to get rid of it in order not to interfere with   $geoNear: {

    //ref: https://docs.mongodb.com/manual/reference/operator/aggregation/geoNear/
    {
      $geoNear: {

        near: {
          tpye: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        //the name of distance field
        // distanceField: 'distance',
        distanceField: "distanceInMiles",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        distanceInMiles: 1,
        name: 1
      }
    }
  ]);


  res.status(200).json({
    status: 'getDistances() is successful',
    requestedAt: req.requestTime, //from app.js => req.requestTime = new Date().toISOString();
    dataFromReqParams: {
      lat,
      lng,
      unit
    },
    data: {
      dataCounts: distances.length,
      data: distances,
    }
  });


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
