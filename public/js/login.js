/*jshint esversion: 6 */
/*jshint esversion: 8 */


const login = async (email, password) => {

  console.log(`\n == The email is: ${email}, passowrd is: ${password} ==\n`);

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

    console.log(result);

  } catch (error) {
    console.log(`\n=== Error log from axios function login.js ===\n`);
    console.log(error);

    console.log(`\n=== Error log from (error.response.data) login.js ===\n`);
    console.log(error.response.data);

  }


};


//Get email and password from the form in host/login page
document.querySelector('.form').addEventListener('submit', element => {
  //prevent submit action from reloading page
  element.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  login(email, password);

});
