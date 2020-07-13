/*jshint esversion: 6 */
/*jshint esversion: 8 */
// All packages and imported scripts will be consolidated into one single file bundle.js by package "parcel-bundler": "^1.12.4" with command :  npm run watch:js  or  npm run build:js

import '@babel/polyfill';
import {
  displayMap
} from './mapbox';
import {
  login,
  logout
} from './login';
import {
  showAlert
} from './alerts';
import {
  updateSettings //for updating user's name & email @host/me page
} from './updateSettings';
import {
  bookTour
} from './stripe'; //


// ==== 1) Preparation before executing functions with DOM elements
// by setting up variables for DOM ELEMENTS to be used in later on
const mapBox = document.getElementById('map'); //for #map id
const loginForm = document.querySelector('.form--login'); //for .form class
const logOutBtn = document.querySelector('.nav__el--logout'); //
const userDataForm = document.querySelector('.form-user-data'); // for updating user's name & email from form class .form-user-data with updateDate()
const userPasswordForm = document.querySelector('.form-user-password'); // for updating user's password & with updateDate()
const bookBtn = document.getElementById('book-tour'); //for #map id
// === Get alert type from URL query string : ?alert=(alertType) ex: ?alert=booking for rendering alert window on the top of page ===
const alertMessage_fromBody = document.querySelector('body').dataset.alert; //Get the dataset attribute "alert" and use its value (the error message set by .pug file) for showAlert() to decide what kind of alert message to be displayed


// ==== 2) Set .addEventListener to elements that are present in the HTML for triggering functions

//  --== (From login.js ==--
//  Get email and password from the form in host/login page
if (loginForm) {

  loginForm.addEventListener('submit', element => {
    //prevent submit action from reloading page
    element.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    //execute login function imported from login.js which can send POST req with axios
    login(email, password);

  });

}


// --== for mapbox.js ==--
// Render map on single tour page

/* Note for using mapbox in index.js:
// Will need to pass in the locations data as argument into displayMap() to render map in HTML section with id: #map

// 1) Get location data from HTML first (the variable mapBox)
// 2) Check if there's element with id #map. If yes, get location data and start rendering map
*/

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}


// ==== Log user out with the "logout" function from login.js ===
if (logOutBtn) {

  logOutBtn.addEventListener('click', logout);

}


// ==== Update user's name and email when there's form with class .form-user-data===
if (userDataForm) {

  userDataForm.addEventListener('submit', element => {
    element.preventDefault();

    const form = new FormData();
    // Use FormData() Constructor as API
    // ref: https://developer.mozilla.org/en-US/docs/Web/API/FormData

    form.append('name', document.getElementById('userName').value);
    form.append('email', document.getElementById('userEmail').value);
    form.append('photo', document.getElementById('photo').files[0]);
    // Note:formData.append(name, value(find by field's name) );
    // ref for form.append: https://developer.mozilla.org/en-US/docs/Web/API/FormData/append

    console.log('\nThe form Object\n');
    console.log(form);

    // (This block is replaced with above form.append)
    // const name = document.getElementById('userName').value;
    // const email = document.getElementById('userEmail').value;

    updateSettings( // arguments: dataToUpdate, typeOfUpdate ('data' or 'password')
      // name,
      // email,
      form, // pass the 'form' obj which has data inside an obj as:  {name: 'someString', email: 'test@gmail.com'}
      'data');
  });

}

// ==== Update user's password when there's form with class .form-user-data===
if (userPasswordForm) {

  userPasswordForm.addEventListener('submit', async (element) => {
    element.preventDefault();
    // Button to be clicked for saving password
    const btnSavePwd = document.querySelector('.btn--save-passowrd');
    // Fields for inputs for updating password
    const passwordCurrent = document.getElementById('password-current');
    const password = document.getElementById('password');
    const passwordConfirm = document.getElementById('password-confirm');

    btnSavePwd.textContent = 'Updating password ...';

    // if new password doesn't match the password in confirm field
    if (password.value !== passwordConfirm.value) {
      //
      btnSavePwd.textContent = 'Save password';
      return showAlert('error', 'Your NEW password doesn\'t match ! Please check them again!');

      // if not entered current password or current password in wrong format
    } else if (!passwordCurrent.value || passwordCurrent.value.length < 8) {
      //
      btnSavePwd.textContent = 'Save password';
      return showAlert('error', 'Please check your current password!');
    }

    // update user's data with async function
    // updateSettings(data, type) in updateSettings.js
    await updateSettings({
      passwordCurrent: passwordCurrent.value,
      password: password.value,
      passwordConfirm: passwordConfirm.value,
      //keys will be parsed into req.body like req.body.passwordConfirm in authController.updatePassword()
    }, 'password');

    btnSavePwd.textContent = 'Save password';

  });
}


if (bookBtn) {
  bookBtn.addEventListener('click', element => {

    element.target.textContent = 'Processing ...';

    const tourId = element.target.dataset.tourId; //get the Id of the current tour page

    /*Note for using "element.target.dataset.tourId" :
    1) In tour.pug,
    button.btn.btn--green.span-all-rows#book-tour(data-tour-id=`${tour.id}`) Book tour now!
    2) Can use syntax like this:  const {tourId} = e.target.dataset;
    */

    console.log('\n  (from js/index.js) The tour id in page: ' + tourId);

    bookTour(tourId); // Create session by using function bookTour = async tourId => { ... in stripe.js

  });

}


if (alertMessage_fromBody) showAlert('success', alertMessage_fromBody, 6);
// function showAlert(errorType, errorMessage, displayDuration_inSeconds = 5)
// If the value of alertMessage_fromBody (the value in the data-set attribute "data-alert") is not empty, call showAlert() pass in the alertMessage_fromBody as error message


//
//
/* === Note for using parcel bundle.js ===

  1. Install package

      cmd:  npm install parcel-bundler --save-dev

  2. Set up npm in package.json file

      In "scripts": {  ,  add code as below

        "watch:js": "parcel watch ./public/js/index.js --out-dir ./public/js/ --out-file bundle.js",
        "bundle:js": "parcel watch ./public/js/index.js --out-dir ./public/js/ --out-file bundle.js"

      ( be careful here. don't type comma after last command  "parcel watch ./public/js/index.js --out-dir ./public/js/ --out-file bundle.js" )

    ### ref for output options:
       https://parceljs.org/cli.html
       https://parceljs.org/cli.html#output-directory
       https://parceljs.org/cli.html#output-filename

    ### ref:  https://github.com/parcel-bundler/parcel#parcel-cli


  3. In base.pug file , use only one script link :

  script(src='/js/bundle.js')

  4. Use CLI to create bundled file with Hot Module Replacement
  cmd:  npm run watch:js
*/
