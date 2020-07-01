/*jshint esversion: 6 */
/*jshint esversion: 8 */

console.log(`=== Log from mapbox.js ===\n`);

//Get the element with id: map and the value in dataset.location
//Then parse the JSON format data into JS Object format
const locations = JSON.parse(document.getElementById('map').dataset.locations);

console.log(locations);
// const locations = document.getElementById('map');

// const locations = JSON.stringify(document.getElementById('map').dataset.locations);

/* Note: in the tour.pug file:
section.section-map
  #map(data-location=`${JSON.stringify(tour.locations)}`)
*/
