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
export const updateSettings = async (dataToUpdate, type) => {

  try {
    //decide what end-point of URL to use for updating either password or data.
    const urlEndPoint = type === 'password' ?
      'http://127.0.0.1:3000/api/v1/users/updateMyPassword' :
      'http://127.0.0.1:3000/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url: urlEndPoint,
      data: dataToUpdate,

      //this PATCH request will rendered as :
      //GET /me?name=Laura+Wilson+Test&email=laura%40example.com 200 2793.498 ms - 4055
    });

    console.log('\nLog from updateSettings\n');
    console.log(res);

    // if the response from server has 'success' in status
    if (res.data.status === 'success') {
      showAlert('success', 'Data updated successfully!');

    }

  } catch (e) {
    showAlert('\n--> Error while updating user\'s data from js/updateSettings.js\n', e);
  }

};
