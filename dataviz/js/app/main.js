define(function (require) {
    
  // Initialize modules
  var $ = require('jquery');
  var d3 = require('d3');
  var nv = require('nv.d3');
  var L = require('leaflet');

  var nexdcp30Tiles = require('app/includes/nasa-nex.holos');
  var holos = require('app/includes/holos-config');
//require('d3.slider');

  require('leaflet.draw');
  require('bootstrap');

  var slider = require('app/includes/time-slider');
  //require('app/includes/time-series-chart');


  // Main fuctionality
  $(function () {

      // INITIALIZE HOLOS ENV
      var env = 'development';

      
      // INITIALIZE D3 COMPONENTS

      // Year slider for map tiles
      var width = $('#year-slider').width();
      var height = $('#year-slider').height();
      var timeScale = nexdcp30Tiles.opts.period;
      var startingValue = new Date('2031');
      var formatDate = d3.time.format("%Y");
      d3.select('#year-slider').call(slider
          .width(width)
          .height(height)
          .timeScale(timeScale)
          .startingValue(startingValue)
          .formatDate(formatDate)
      );
      //Chart

      
      // BOOTSTRAP INITIALIZATIONS

      // Tooltips
      $('[data-toggle="tooltip"]').tooltip();

      //Map controls

      


      // INITIALIZE LAYERS

      // Basemap
      var CartoDB_DarkMatter = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
        attribution: '<a href="http://www.openstreetmap.org/copyright" target="_blank">OSM</a> | <a href="http://cartodb.com/attributions" target="_blank">CartoDB</a> |',
        subdomains: 'abcd',
        maxZoom: 19
      });

      // FeatureGroup to store editable layers
      var drawnItems = new L.FeatureGroup();

      //NASA NEX-DCP30 raster tiles from HOLOS
      var climateRasterUrl = nexdcp30Tiles.getURL({
        model: 'gfdl-esm2m',
        scenario: 'rcp60',
        climatevar: 'tasmax'
      });

      climateRasterUrl = holos[env].tileserver + climateRasterUrl;

      var climateRaster = L.tileLayer( climateRasterUrl, {
          attribution: '<a href="https://cds.nccs.nasa.gov/nex/" target="_blank">NASA</a>',
          subdomains: ["otile1", "otile2", "otile3", "otile4"],
          opacity: 0.5
      });

      


      // INITIALIZE MAP

      var map = L.map('map', {
        center: [39.82, -98.57],
        zoom: 5,
        minZoom: 5,
        maxZoom: 15,
        attributionControl: false,
        //layers: [CartoDB_DarkMatter, climateRaster, drawnItems]
        layers: [CartoDB_DarkMatter, drawnItems]
      });

      // Create custom leaflet icon for marker
      var icon =  L.icon({
        iconUrl: 'css/images/marker-icon.png'
      });

      // Add Leaflet.draw control to map
      var drawControl = new L.Control.Draw({
        draw: {
          polyline: false,
          polygon: false,
          circle: false,
          rectangle: {
            shapeOptions: {
              color: '#0078A8'
            },
            showArea: false
          },
          marker: {
            icon: icon
          }
        },
        edit: {
          featureGroup: drawnItems,
          edit: false,
          remove: false
        }
      });
      map.addControl(drawControl);



      // INITIALIZE QUERY PARAMS

      var geojson;

      var params = {
        geojson: geojson
      }



      // MAP INTERACTIONS

      // Clear previously drawn marker or polygon
      map.on('draw:drawstart', function() {
        drawnItems.clearLayers();
      })

      // Create geojson on map click or draw
      map.on('draw:created', function (e) {
        
        drawnItems.clearLayers();
        
        // add new layer
        var featureCollection = drawnItems.addLayer(e.layer) .toGeoJSON();
        params.geojson = featureCollection[0];
        console.log(drawnItems);

        // Update query params and redraw charts
      
      });





      // TIME SLIDER  INTERACTIONS

      // Fetch new raster tiles from holos

      // Update date in upper right corner







      // INITIALIZE CHART



  





  });


});