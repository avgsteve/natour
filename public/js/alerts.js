/*jshint esversion: 6 */
/*jshint esversion: 8 */

// Close message window with the DOM element
export const hideAlert = () => {
  //
  const alertElement = document.querySelector('.alert');
  //
  if (alertElement) {
    alertElement.parentElement.removeChild(alertElement);
  }
};

//display popup window for alert message on top of the web page
export const showAlert = (errorType, errorMessage, displayDuration_inSeconds = 5) => {

  //make sure all alert element (if any) before make a new one
  hideAlert();

  // errorType is "success" or "error"
  const markupForError = `<div class="alert alert--${errorType}">${errorMessage}</div`;

  //insert error message div block on the top of the first child element under body section in HTML
  document.querySelector('body').insertAdjacentHTML('afterbegin', markupForError);

  //Then hide the alert after in designated period of time in seconds
  window.setTimeout(hideAlert, displayDuration_inSeconds * 1000);

};
