/*jshint esversion: 6 */
/*jshint esversion: 8 */
/*jshint esversion: 9 */
/*
This email.js file
  is used by :  exports.forgotPassword
  as in :       router.post('/forgotPassword', authController.forgotPassword);
*/

const nodemailer = require('nodemailer'); //ref:  https://nodemailer.com/usage/
const pug = require('pug');
const htmlToText = require('html-to-text');
//
// new Email(user, url).sendWelcome();

module.exports = class EmailWithNodeMailer {

  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Steve (Chi-Yuan) Leng <${process.env.EMAIL_FROM}>`; //use the env variable in config.env
  }

  // Set up options ( nodemailer.createTransport() )
  // for sending email with nodemailer
  // => ref: https://nodemailer.com/smtp/

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return 1;
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      }

      /*// in config.env
      EMAIL_HOST=smtp.mailtrap.io
      EMAIL_PORT=2525
      EMAIL_USERNAME=62e7c5........
      EMAIL_PASSWORD=2ac0c8........
      */
      // ref: https://nodemailer.com/smtp/#1-single-connection


      // Activate in gmail "less secure app" option
    });

  }

  // Send the actual mail in HTML format with 'pug'
  async send(pugTemplate, subject) {

    // 1) Render HTML based on a pug template received as parameter "pugTemplate". Will be used in mailOptions(the argument in sendMail() method)
    const htmlFromPug = pug.renderFile(
      //first argument: The path to the Pug file to render
      `${__dirname}/../views/email/${pugTemplate}.pug`,
      //Second argument: An options object, also used as the locals object (the variable can be accessed by pug template)
      {
        firstName: this.firstName,
        url: this.url,
        subject: subject
      },
      //third arguments: (optional) callback function

      // => ref:  https://pugjs.org/api/reference.html#pugrenderfilepath-options-callback
    );

    // 2) Define email options (for the sendMail() method below)
    const mailOptions = {
      // ref:  https://nodemailer.com/message/#common-fields

      //key and value as properties (mail options)
      from: this.from, //'Steve Leng <steve.leng@test.com>',
      to: this.to,
      subject: subject,
      html: htmlFromPug,
      text: htmlToText.fromString(htmlFromPug), // Use package "html-to-text" to convert html file to text

      // ref:  https://nodemailer.com/message/#common-fields
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
    /* Send email with the setting (returned newTransport) and sendMail() method from newTransport obj  */

    //ref: https://nodemailer.com/about/#example

  }

  // Use sendWelcome() to call "this" object's .send() method to send emails

  // send(pugTemplate, subject)

  // ===> email type 1): welcome message
  // Used by exports.signup in authController.js
  async sendWelcome() {
    await this.send('welcome', 'Welcome to Natours!');
  }

  // ===> email type 1): password reset
  async sendPasswordReset() {
    await this.send(
      //template name: passwordReset.pug
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }

};
/*// in config.env
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USERNAME=62e7c5........
EMAIL_PASSWORD=2ac0c8........
*/
// ref: https://nodemailer.com/smtp/#1-single-connection


// Activate in gmail "less secure app" option
