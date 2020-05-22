/*jshint esversion: 6 */
/*jshint esversion: 8 */
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



// 2) ============== ROUTE-HANDLERS

exports.getAllTours = async (req, res) => {

  //using newly create middleware function to log time
  console.log(`(from ${scriptName}: ) The requested was made at ${req.requestTime}`);
  // console.log('typeof(tours): ' + typeof(tours));

  try {
    // get all current data from DB
    const tours = await Tour.find(); //ref:  https://mongoosejs.com/docs/api.html#model_Model.find

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: tours.length,
      data: {
        tours: tours,
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

  // ===建立資料的方法一 : new Model() & save()
  // // create new data from "document" class
  // const newTour = new Tour({});
  // newTour.save();
  /*  https://mongoosejs.com/docs/api.html#document_Document-save
  If save is successful, the returned promise will fulfill with the document saved.
*/

  // ===建立資料的方法二  await model.create(req.body)
  // create new data from "model" class
  // ref: https://mongoosejs.com/docs/models.html
  // Models are fancy constructors compiled from Schema definitions. An instance of a model is called a document. Models are responsible for creating and reading documents from the underlying MongoDB database.

  try {
    const newTour = await Tour.create(req.body);
    //model.create() is a Shortcut for saving one or more documents to the database. MyModel.create(docs) does new MyModel(doc).save() for every doc in docs.
    //Returns:  «Promise»

    //ref:  https://mongoosejs.com/docs/api.html#model_Model.create
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
