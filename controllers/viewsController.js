/*jshint esversion: 6 */
/*jshint esversion: 8 */
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

//
exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection (from database)
  const tours = await Tour.find();

  console.log("\nthe tours data from exports.getOverview\n");
  console.log(tours);


  // 2) Build template


  // 3) Render that template using tour data from 1)

  res.status(200).render('overview', {
    title: 'All tours',
    tours: tours
  });

});

//
exports.getTour = (req, res) => {

  res.status(200).render('tour', {
    title: 'The Forest Hiker Tour'
  });

};
