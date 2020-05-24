/*jshint esversion: 6 */
/*jshint esversion: 8 */
/*jshint esversion: 9 */
const path = require('path');
const scriptName = path.basename(__filename);
const Tour = require('./../models/tourModel');

/* for testing purpose
// 1) ============== middleware functions
//// 將JSON檔案轉成物件(Obj)檔案格式
const tours = JSON.parse(
  // fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);
*/

//refactoring code by using class
class APIFeatures {
  constructor(query, queryString) {
    // First parameter "query" is the query obj from using mongoose's 'Model class' ,
    // Second parameter "queryString" is the req.query's key and values string from the parsed URL request by express.js
    this.query = query; //ex: after using Query methods like Tour.find() , Tour.sort() etc,.
    this.queryString = queryString;
    // captured query string parameter from HTTP requests. Ex: req.query.page, req.query.field etc,.
  }

  //APIfeatures.filter()
  filter() {
    const queryObj = {
      ...this.queryString
      // ex:   duration: { gte: '5' },   fields: 'name,duration,difficulty,price'
    };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    // // making the processed JSON strings back to Obj format and save it back to this.query
    this.query = this.query.find(JSON.parse(queryStr));

    return this; //makes APIfeatures.filter() has props and value of the whole updated Obj
  }

  //APIfeatures.sort()
  sort() {
    // // 2) SORTING ( with mongoose Model.find().sort() )
    if (this.queryString.sort) {
      /*  req.query.sort obj examples
      //ex: http://127.0.0.1:3000/api/v1/tours?sort=-price,ratingsAverage
      //then the sorting string of req.query.sort will be : { sort: '-price,ratingsAverage' }
      */

      // reformat the sorting string (value of this.queryString.sort, ex: sort: '-price,ratingsAverage')
      // from sort: "x,y" to "x y" to match the format of arguments for .sort()
      const newSortingQuery = this.queryString.sort.split(",").join(" ");

      console.log('\nReformated sorting string from "req.query.sort"is :  ' + newSortingQuery + '\n');
      /* sorting method examples :
    //  **** sort by "field" ascending and "test" descending
    query.sort({ field: 'asc', test: -1 });
    //  **** equivalent
    query.sort('field -test');
*/
      //update the this.query with a new query after executing method of ".sort(string)"
      this.query = this.query.sort(newSortingQuery);
      //ref:  https://mongoosejs.com/docs/api/query.html#query_Query-sort

    } else {
      //provide a default sorting string
      this.query = this.query.sort('price');
    }

    return this; // return the whole updated class instance itself

  }

  //APIfeatures.limit()
  limitFields() {
    // 3) Field limiting (projecting) by using .select() method
    // (to send back only required key-value to reduce the size of requested data)
    if (this.queryString.fields) {

      const selectedFields = this.queryString.fields.split(",").join(" ");

      console.log('\nString from req.query.fields: \n  ==>' + this.queryString.fields + "\n reformated to :  \n --->" + selectedFields + "\n");

      this.query = this.query.select(selectedFields);

      //ref:  https://mongoosejs.com/docs/api/query.html#query_Query-select
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    // 4) Pagination (by using .skip() and .limit() methods )

    // Set default value of page from the .page property
    const page = +this.queryString.page || 1;
    // To pre-define the limit of maximun number of results to be returned
    const limit = +this.queryString.limit || 100;
    // how many documents to skip in the result, page 2 will skip the number of limit multiplied by the page before (which is page - 1)
    const skip = (page - 1) * limit;

    console.log(`\x1b[31m\nCurrent query output limit is : ${limit}\x1b[0m,\nCurrent page is #${page} and there are ${skip} of the results have been skipped`);

    // Decide how many results to skip and the maximun number of results
    // ex: page 2 is result #11 to #20 -->
    this.query = this.query.skip(skip).limit(limit);
    /* ref:
    //page=2&limit=10, 1-10 is page 1, 11-20 is page 2,
    // .skip:  https://mongoosejs.com/docs/api/query.html#query_Query-skip
    // .limit:  https://mongoosejs.com/docs/api/query.html#query_Query-limit
*/

    /*  (No need to throw an error when user gets NO data if the user uses too much number of pages )

        if (this.queryString.page) {

          // .countDocuments() will return how many results from the query
          const numOfTourResults = this.query.countDocuments(); //will return a query Promise obj

          // ref:  https://mongoosejs.com/docs/api/model.html#model_Model.countDocuments

          if (skip >= numOfTourResults) throw new Error('The number of skip is greater than query numbers');

          // the new Error message in try { ... } method will be moved on to catch { } block as error message and trigger status 404 content immediately

        }
    */
    return this;

  }

}

// 2) ============== ROUTE-HANDLERS
// pre-filling the query objs before using next middleware (getAllTours)
exports.aliasTopTours = (req, res, next) => {
  // for touRoutes.js => router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  //{ sort: '-ratingsAverage,price' }
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next(); // which is tourController.getAllTours
};

exports.getAllTours = async (req, res) => {
  //log current file name and time from
  console.log(`\n(from ${scriptName}: ) The requested was made at ${req.requestTime}`);
  console.log("\x1b[93m", "\nThe req.query obj from the GET request:", "\x1b[0m\n");
  console.log(req.query);

  // { difficulty: 'easy', duration: { gte: '5' } }

  try {

    //將所有
    const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate(); //To use APIfeatures. filter method

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
  } catch (error) {
    console.log("\nThere's an error in getAllTours() after GET request!: \n");
    console.log(error);
    //send error response with status code 400
    res.status(404).json({
      status: 'getting all data failed!',
      errorMessage: error,
    });
  }

};

// 2-1) ROUTE-HANDLERS with " params from router.route('/:id') "
// ===> get only one result from Obj's "tours" array
exports.getTour = async (req, res) => {
  // req來自於 router.route('/:id').get(getTour)，params property key為 :id
  // to log the current req params from URI
  console.log(`\n(from ${scriptName}: ) The req.param is: `);
  console.log(req.params);
  //ex: 127.0.0.1:3000/api/v1/tours/5 的GET request 會顯示  "req.params": {"id": "5"}

  try {
    // get all current data from DB
    const tour = await Tour.findById(req.params.id); //ref:  https://mongoosejs.com/docs/api.html#model_Model.find
    // Tour.findById(req.params.id) equals to the function Tour.findOne( {_id: req.param.id} )

    res.status(200).json({
      status: 'success',
      inputs: {
        'req.params': req.params,
        'numberOfResults': "1",
        // 'tour': tour,
      },
      data: tour,
    });
  } catch (error) {
    console.log("\nThere's an error in getTour() after GET request!: \n");
    console.log(error);
    //send error response with status code 400
    res.status(404).json({
      status: 'getting the required data failed!',
      errorMessage: error,
    });
  }

  //在tours Array 裡面搜尋有key: id跟req.params相符內容，並透過find傳回整個符合條件的 Array
  // const tour = tours.find(el => el.id === +req.params.id); //req.params.id前的+號是coersion為數值


};

// ===> create new data from POST request
exports.createTour = async (req, res) => {
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

  try {
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

  } catch (error) {
    console.log("\nThere's an error in createTour() after POST request!: \n");
    console.log(error);
    //send error response with status code 400
    res.status(400).json({
      status: 'adding new data failed!',
      errorMessage: error,
    });
  }



};

// ===> updateTour
exports.updateTour = async (req, res) => {
  //在tours Array 裡面搜尋有key: id跟req.params相符內容，並透過find傳回整個符合條件的 Array
  // exports.tour = tours.find(el => el.id === +req.params.id); //req.params.id前的+號是coersion為數值

  try {

    console.log(`\nupdating data with the id "${req.params.id}" & req body:`);
    console.log(req.body);



    const updatedData = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, //if true, runs update validators on this command. Update validators validate the update operation against the model's schema.

    });
    //ref:  https://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate  --> Model.findByIdAndUpdate('id', UpdateContentObj, optionsObj)

    res.status(200).json({
      status: "success",
      message: "data is successfully updated!",
      data: {
        // tour: 'updated content here...',
        tour: updatedData,
      }
    });


  } catch (error) {
    console.log("\nThere's an error in updateTour() after PATCH request!: \n");
    console.log(error);
    //send error response with status code 400
    res.status(404).json({
      status: 'Updating the data has failed!',
      errorMessage: error,
    });

  }



};

//// ===> deleteTour
exports.deleteTour = async (req, res) => {
  try {

    console.log('\n===== req.param for DELETE request is:');
    console.log(req.params);

    await Tour.findByIdAndDelete(req.params.id);
    //https://mongoosejs.com/docs/api.html#model_Model.findByIdAndDelete

    // status 204 will not send out data to browser , only the status code 204
    res.status(204).json({
      status: 'success',
      data: null,
    });

  } catch (err) {
    console.log("\nThere's an error in deleteTour() after DELETE request!: \n");
    console.log(error);
    //send error response with status code 400
    res.status(404).json({
      status: 'delete new data failed!',
      errorMessage: error,
    });

  }
};


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
