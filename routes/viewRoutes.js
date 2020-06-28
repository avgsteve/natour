/*jshint esversion: 6 */
/*jshint esversion: 8 */
const express = require('express');

const viewsController = require('../controllers/viewsController');

const router = express.Router();

/* The for testing purpose
const router = express.Router();

//在 app.js 裡面，原本的寫法是 app.get
router.get('/', (req, res) => {
  //render base.pug
  res.status(200).render('base', {
    //This obj argument with properties is called "locals"
    //ref:  http://expressjs.com/en/5x/api.html#res.render
    tour: 'The Forest Hiker',
    user: 'Steve'
  });

  // note: This middle ware function reads setting from the code in this router.js file as below:
  // router.set('view engine', 'pug');
  // //will create a path with a joined path name
  // router.set('views', path.join(__dirname, 'views'));
});
*/

//
router.get('/', viewsController.getOverview);

//
router.get('/tour', viewsController.getTour);


module.exports = router;
