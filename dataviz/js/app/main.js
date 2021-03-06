define(function (require) {
  // Initialize modules
  var $ = require('jquery');
  var d3 = require('d3');
  var L = require('leaflet');
  require('leaflet.draw');
  require('bootstrap');

  var tiles = require('app/includes/tiles');
  var timeSlider = require('app/includes/time-slider');
  var seriesChart = require('app/includes/tseries-chart');


  // Main fuctionality
  $(function() {
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
    var rasterTilesUrl = tiles.getURL();

    var rasterLayer = L.tileLayer(rasterTilesUrl, {
      attribution: '<a href="https://cds.nccs.nasa.gov/nex/" target="_blank">NASA</a>',
      subdomains: ["otile1", "otile2", "otile3", "otile4"],
      opacity: 0.5
    });

    //Variables to store NASA NEX-DCP30 raster tile options
    var rasterTilesOptions = tiles.getOpts();


    // BOOTSTRAP INITIALIZATIONS
    // Tooltips
    $('[data-toggle="tooltip"]').tooltip();
    $('.dropdown-menu > li').click(function(evt) {
      var menuText = $(evt.target).text();
      tiles.select(menuText.toLowerCase());
      updateMap();
      $('.scenario > span').text(tiles.scenarioNumber());
      $('.climatevar').text(menuText);
    });


    // INITIALIZE MAP
    var map = L.map('map', {
      center: [39.82, -98.57],
      zoom: 5,
      minZoom: 5,
      maxZoom: 15,
      attributionControl: false,
      layers: [CartoDB_DarkMatter, rasterLayer, drawnItems]
    });

    // Create custom leaflet icon for marker
    var icon = L.icon({
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


    // INITIALIZE D3 COMPONENTS

    // Year slider for map tiles
    var sliderWidth = $('#map-tile-slider').width();
    var sliderHeight = $('#map-tile-slider').height();
    var sliderTimeScale = rasterTilesOptions.timeScale;
    var sliderDate = tiles.date();
    var sliderFormatDate = d3.time.format('%Y');

    var yearSlider = timeSlider.width(sliderWidth)
      .height(sliderHeight)
      .timeScale(sliderTimeScale)
      .dateValue(sliderDate)
      .formatDate(sliderFormatDate);

    d3.select('#slider-svg').call(yearSlider);

    // TIME SLIDER  INTERACTIONS
    // Fetch new raster tiles from holos
    yearSlider.on('brushed', function(d) {
      var date = sliderFormatDate.parse(d);
      setTimeout(function() {
        tiles.date(date);
        updateMap();
      }, 1000);
    });

    var updateMap = function() {
      // Fetch new tiles
      rasterTilesUrl = tiles.getURL();
      rasterLayer.setUrl(rasterTilesUrl);
      // Update date in upper right corner
      $('.map-tile-current h2').text(sliderFormatDate(tiles.date()));
    };

    // MAP INTERACTIONS
    // Clear previously drawn marker or polygon
    map.on('draw:drawstart', function() {
      drawnItems.clearLayers();
    });

    // Create geojson on map click or draw
    map.on('draw:created', function (e) {
      drawnItems.clearLayers();
      // Add selection as new layer
      drawnItems.addLayer(e.layer);
      var geojson = e.layer.toGeoJSON().geometry;
      tiles.dataParams({g: JSON.stringify(geojson)});
      seriesChart.draw(tiles);
    });
  });
});
