/*jshint esversion: 6 */
/*jshint esversion: 8 */
import '@babel/polyfill';
import {
  displayMap
} from './mapbox';
import {
  login
} from './login';


// == 1) preparation before executing functions with DOM elements
// == setting up variables for DOM ELEMENTS to be used in later on
const mapBox = document.getElementById('map'); //for #map id
const loginForm = document.querySelector('.form'); //for .form class


// === (login.js) Get email and password from the form in host/login page
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


// ==== for mapbox.js ===

/* Note for using mapbox in index.js:

// Will need to pass in the locations data as argument into displayMap() to render map in HTML section with id: #map

// 1) Get location data from HTML first (the variable mapBox)
// 2) Check if there's element with id #map. If yes, get location data and start rendering map
*/

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}




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
console.log("" + "\n=== Message from index.js ===" + "\n");
