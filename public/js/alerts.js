/*jshint esversion: 6 */
/*jshint esversion: 8 */


export const hideAlert = () => {
  //
  const alertElement = document.querySelector('.alert');
  //
  if (alertElement) {
    alertElement.parentElement.removeChild(alertElement);
  }
};


export const showAlert = (errorType, errorMessage) => {

  //make sure all alert element (if any) before make a new one
  hideAlert();

  const markupForError = `<div class="alert alert--${errorType}">${errorMessage}</div`;

  //insert error message div block on the top of the first child element under body section in HTML
  document.querySelector('body').insertAdjacentHTML('afterbegin', markupForError);

  //Then hide the alert after 3 seconds
  window.setTimeout(hideAlert, 3000);

};
