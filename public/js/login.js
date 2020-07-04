/*jshint esversion: 6 */
/*jshint esversion: 8 */

import axios from 'axios';
import {
  showAlert
} from './alerts';

// Use "export" - the key word from 'Common JS' to export module in Node.js.  ref:  https://stackoverflow.com/questions/42461330/difference-between-export-const-foo-export-default-foo-and-module-exports-foo
export const login = async (email, password) => {

  // console.log(`\n == The email is: ${email}, passowrd is: ${password} ==\n`);

  try {

    const result = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email: email,
        password: password
      }
      //ref for Axios: https://github.com/axios/axios
    });

    // === Check log in process in console ===
    console.log("\n%c✔️ Log in OK!\n", 'background: #00C000 ; color: #FEEBFF');
    console.log(`\n=== HTTP 200 log from login.js ===\n`);
    console.log(result);

    console.log(`\n=== HTTP 200 data for token from login.js ===\n`);
    console.log(result.data.token);

    // === Redirect page after log in is successful ===
    //
    if (result.data.status === 'success') {
      showAlert("success", 'Logged in successfully!');
      //
      window.setTimeout(
        () => {
          location.assign('/');
        },
        500);
    }

  } catch (error) {

    // === Check log in process in console ===
    console.log("\n%c❌ Login has failed!\n", 'background: #FE2500 ; color: #000036');
    console.log(`\n=== Error log from axios function login.js ===\n`);
    console.log(error);

    console.log(`\n=== Error log from (error.response.data) login.js ===\n`);
    console.log(error.response.data);
    // console.log(error.response.data.message); //  "Incorrect email or password"

    // display error message with alert popup
    showAlert("error", error.response.data.message);

    //end of try/catch block
  }


};

// Let user LOG OUT By sending the token expires immediately in a very short period of time
export const logout = async (email, password) => {

  try {

    // Send a get request to server to get a token for log-out
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout'
    });

    // if the GET req is successful
    if (res.data.status === 'success') {

      let domainName = window.location.origin;
      //then force browser to reload page from server instead of from cache.
      window.setTimeout(() => {
        location.replace(domainName);
        // location.reload(true);

      }, 1500);
    }

    showAlert("success", 'Logged OUT successfully! Now reloading the page...');

  } catch (error) {
    showAlert('error', 'Error logging out! Please try again.');
  }

};
