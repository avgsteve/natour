/*jshint esversion: 6 */
/*jshint esversion: 8 */

console.log(`=== Log from mapbox.js ===\n`);

//Get the element with id: map and the value in dataset.location
//Then parse the JSON format data into JS Object format
const locations = JSON.parse(document.getElementById('map').dataset.locations);

console.log(locations);

/* Note: in the tour.pug file, this code:
    section.section-map
      #map(data-location=`${JSON.stringify(tour.locations)}`)

  will set "data-location" attribute like below:
    <section class="section-map"><div id="map" data-locations="[{&quot;type&quot;:&quot;Point&quot;,&quot;coordinates&quot
*/



// ==== using Mapbox in HTML file ====
// Make to use script file before </body> for configurating the Mapbox map first:
// <script src="/js/mapbox.js"></script>

// Using mapbox with CDN and the code from instruction on www.mapbox.com
// ref:  https://www.mapbox.com/install/js/cdn-add/

//    --==== Unique token for rendering map in page
mapboxgl.accessToken = 'pk.eyJ1IjoiYXZnc3RldmUiLCJhIjoiY2tjM2Y0cXBvMmN5bDM0bXh5bmFxbjBrMiJ9.1foja_AwKRS0p_Xrn-zX1g';
// creating new tokens for different project: https://account.mapbox.com/access-tokens

//    --==== configuration for Mapbox map
var map = new mapboxgl.Map({
  container: 'map',

  // style property for using default or customized map styles
  style: 'mapbox://styles/avgsteve/ckc3fgxvn0svq1itaflci74ke'
  // Get map styling code: https://studio.mapbox.com/
  // -> Share options -> Developer resources : "Web" -> Style URL
});
