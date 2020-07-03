/*jshint esversion: 6 */
/*jshint esversion: 8 */

export const displayMap = (locations) => {


  console.log(`=== Log from mapbox.js ===\n`);

  /*
  // Get the coordinates value in dataset.location from the element with id: map
  const locations = JSON.parse(document.getElementById('map').dataset.locations);
  //Then parse the JSON format data into JS Object format
*/

  /* ### The sample Object content (from variable "locations") ###
  [
    {
      "type": "Point",
      "coordinates": [
        -73.967696,
        40.781821
      ],
      "_id": "5c88fa8cf4afda39709c2960",
      "description": "New York",
      "day": 1
    },
    {
      "type": "Point",
      "coordinates": [
        -118.324396,
        34.097984
      ],
      "_id": "5c88fa8cf4afda39709c295f",
      "description": "Los Angeles",
      "day": 3
    },
    {
      "type": "Point",
      "coordinates": [
        -122.408865,
        37.787825
      ],
      "_id": "5c88fa8cf4afda39709c295e",
      "description": "San Francisco",
      "day": 5
    }
  ]
  */

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

  // documentation:  https://docs.mapbox.com/mapbox-gl-js/api/

  // Using mapbox with CDN and the code from instruction on www.mapbox.com
  // ref:  https://www.mapbox.com/install/js/cdn-add/

  //    --==== Unique token for rendering map in page
  mapboxgl.accessToken = 'pk.eyJ1IjoiYXZnc3RldmUiLCJhIjoiY2tjM2Y0cXBvMmN5bDM0bXh5bmFxbjBrMiJ9.1foja_AwKRS0p_Xrn-zX1g';
  // creating new tokens for different project: https://account.mapbox.com/access-tokens

  //    --==== configuration for Mapbox map
  //    ref:  https://docs.mapbox.com/mapbox-gl-js/api/map/
  var map = new mapboxgl.Map({

    // ref for all parameters:
    // https://docs.mapbox.com/mapbox-gl-js/api/map/#map-parameters

    // Find the HTML element with the id "map" in which will be the "container" to render map.
    container: 'map',

    // style property for using default or customized map styles
    style: 'mapbox://styles/avgsteve/ckc3fgxvn0svq1itaflci74ke',
    // To get map styling code: https://studio.mapbox.com/
    // -> Share options -> Developer resources : "Web" -> Style URL

    // set default map location
    // ref:  https://docs.mapbox.com/mapbox-gl-js/example/attribution-position/index.html
    center: [-77.04, 38.907],

    //Set default zoom
    zoom: 15,

    //To disable the zoom-in zoom-out functionality (but still draggable)
    scrollZoom: false,


    //// to make map static (can't be dragged. Will look like a photo on page)
    // interactive: false

  });

  // === Add marker(s) on map and area to be displayed ===

  // Set the area will be displayed on the map by creating new mapboxgl.LatLngBounds(); Obj
  // https://docs.mapbox.com/mapbox-gl-js/api/geography/#lnglatbounds

  // If no arguments are provided to the constructor, a null bounding box is created.
  const bounds = new mapboxgl.LngLatBounds();
  // new .LngLatBounds obj will be worked with the code: bounds.extend(singleLocation.coordinates); to set bound (display area) for all given coordinates



  // Look for coordinates in each singleLocation to create marker on map by looping through the locations data Array
  locations.forEach(singleLocation => {

    // create and node element for adding marker later
    // note: CSS for Marker: style.css --> .marker {}
    const nodeElement = document.createElement('div');
    nodeElement.className = 'marker';

    // make new marker Obj.  ref: Markers and controls
    // https://docs.mapbox.com/mapbox-gl-js/api/markers/
    new mapboxgl.Marker({
        element: nodeElement,

        //Set the bottom of the pin as the exact geolocation (like an anchor)
        anchor: 'bottom',

        // ref: https://docs.mapbox.com/help/tutorials/custom-markers-gl-js/#add-markers-to-the-map

      })

      // (chainable methods)
      // THEN set the coordinates (which is read from each location item from "locations" Array) for the marker
      .setLngLat(singleLocation.coordinates)

      //Then add (attach) the marker object to map obj
      .addTo(map); //ref: https://docs.mapbox.com/mapbox-gl-js/api/markers/#marker#addto



    // ===  Add popup caption effect on each marker (location) ===
    new mapboxgl.Popup(
        //object for options
        {
          // property "offset" : To adjust position off-set for popup caption. Value can be Number or Array [x,y]
          offset: 50,
          // other properties:  https://docs.mapbox.com/mapbox-gl-js/api/markers/#popup-parameters
        })
      .setLngLat(singleLocation.coordinates)
      //The caption content (as HTML code)
      .setHTML(`<p>Day ${singleLocation.day}:  ${singleLocation.description}</p>`)
      .addTo(map);

    // === Setting map boundary by using bounds.extend: ===
    // Extend map bounds to include current location
    // ref: https://docs.mapbox.com/mapbox-gl-js/api/geography/#lnglatbounds#extend

    // parameters: obj((LngLatLike | LngLatBoundsLike)) .  ref: https://docs.mapbox.com/mapbox-gl-js/api/geography/#lnglatlike

    bounds.extend(singleLocation.coordinates);

    // End of locations.forEach(singleLocation => {
  });


  // ==== Panning map location to another ===

  // Use fitBounds to show a specific area of the map in view, regardless of the pixel size of the map.  ref: ref: https://docs.mapbox.com/mapbox-gl-js/example/fitbounds/

  // Pans and zooms the map to contain its visible area within the specified geographical bounds. This function will also reset the map's bearing to 0 if bearing is nonzero.  ref: https://docs.mapbox.com/mapbox-gl-js/api/map/#map#fitbounds

  // Basic fitBounds code:  map.fitBounds(bounds);

  // fitBounds code with arguments and parameters.
  // ref:  https://docs.mapbox.com/mapbox-gl-js/api/map/#fitbounds-parameters
  map.fitBounds(bounds,

    //Create paddings for the marker displayed on map by passing in an "padding" obj as argument. ref: https://docs.mapbox.com/mapbox-gl-js/api/properties/#paddingoptions-example
    {
      padding: {
        //units: px
        top: 300,
        bottom: 150,
        left: 100,
        right: 150
      }
    }
  );

};
