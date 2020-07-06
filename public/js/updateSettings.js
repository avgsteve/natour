/*jshint esversion: 6 */
/*jshint esversion: 8 */

// update data
import axios from 'axios';
import {
  showAlert
} from './alerts';


//get the data (name, email fields) to be updated with this updateDate function used in index.js
export const updateData = async (name, email) => {

  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:3000/api/v1/users/updateMe',
      data: {
        // get name and email value directly from DOM element in index.js
        name,
        email
      }
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
