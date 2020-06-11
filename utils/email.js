/*jshint esversion: 6 */
/*jshint esversion: 8 */
/*jshint esversion: 9 */
const nodemailer = require('nodemailer'); //ref:  https://nodemailer.com/usage/

const sendEmail = async options => {

  // 1) Create a transporter //transporter is going to be an object that is able to send mail
  const transporter = nodemailer.createTransport({
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
  // 2) Define the email options consist of fields for mail content // https://nodemailer.com/message/#common-fields
  const mailOptions = {
    from: 'Steve Leng <steve.leng@test.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // 3) Actually send the mail  //https://nodemailer.com/usage/#sending-mail
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
