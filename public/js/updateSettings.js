/*jshint esversion: 6 */
/*jshint esversion: 8 */

// update data
import axios from 'axios';
import {
  showAlert
} from './alerts';

// ref: https://www.npmjs.com/package/axios-debug-log
require('axios-debug-log')({
  request: function(debug, config) {
    debug('Request with ' + config.headers['content-type']);
  },
  response: function(debug, response) {
    debug(
      'Response with ' + response.headers['content-type'],
      'from ' + response.config.url
    );
  },
  error: function(debug, error) {
    // Read https://www.npmjs.com/package/axios#handling-errors for more info
    debug('Boom', error);
  }
});


//get the data (name, email fields) to be updated with this updateDate function used in index.js
//type is either 'password' or 'data'
export const updateSettings = async (dataToUpdate, typeOfUpdate) => {

  try {
    //decide what end-point of URL to use for updating either password or data.
    const urlEndPoint = typeOfUpdate === 'password' ?
      // 'http://127.0.0.1:3000/api/v1/users/updateMyPassword' :
      // 'http://127.0.0.1:3000/api/v1/users/updateMe';
      '/api/v1/users/updateMyPassword' :
      '/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url: urlEndPoint,
      data: dataToUpdate,
      /* dataToUpdate obj should have the key and value:

      {
        password: theValueOfNewPassWord
        passwordConfirm
      }


      user.password = req.body.password;
      user.passwordConfirm = req.body.passwordConfirm;


      */


      //this PATCH request will rendered as :
      //GET /me?name=Laura+Wilson+Test&email=laura%40example.com 200 2793.498 ms - 4055
    });

    console.log('\nLog for the HTTP response from js/updateSettings.js\n');
    console.log(res);

    // if the response from server has 'success' in res.data.status
    if (res.data.status === 'success') {
      showAlert('success', 'Data updated successfully!');
      setTimeout(window.location.reload.bind(window.location), 2000);
    }

  } catch (e) {
    showAlert('error', "Your password is incorrect!");
  }

};
