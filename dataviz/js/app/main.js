define(function (require) {
    
  // Initialize modules
  var $ = require('jquery');
  var d3 = require('d3');
  d3.tip = require('d3.tip');
  //var nv = require('nv.d3');
  var L = require('leaflet');

  var nexdcp30Tiles = require('app/includes/nasa-nex.holos');
  var timeSlider = require('app/includes/time-slider');
  var holos = require('app/includes/holos-config');


  require('leaflet.draw');
  require('bootstrap');
 


  // Main fuctionality
  $(function () {

      // INITIALIZE HOLOS ENV
      var env = 'development';



      // BOOTSTRAP INITIALIZATIONS

      // Tooltips
      $('[data-toggle="tooltip"]').tooltip();



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
      var rasterTiles = nexdcp30Tiles();
      rasterTilesUrl = holos[env].tileserver + rasterTiles.getURL();

      var rasterLayer = L.tileLayer( rasterTilesUrl, {
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
        layers: [CartoDB_DarkMatter, rasterLayer, drawnItems]
        //layers: [CartoDB_DarkMatter, drawnItems]
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
      // TODO: This should be part of data manager module

      var queryParams = {
        
      }




      
      // INITIALIZE D3 COMPONENTS

      // Year slider for map tiles
      var slider_width = $('#map-tile-slider').width();
      var slider_height = $('#map-tile-slider').height();
      var slider_timeScale = rasterTiles.getOpts().timeScale;
      var slider_startingValue = new Date('2031-03');
      var slider_formatDate = d3.time.format("%B %Y");
      var yearSlider = timeSlider
            .width(slider_width)
            .height(slider_height)
            .timeScale(slider_timeScale)
            .startingValue(slider_startingValue)
            .formatDate(slider_formatDate);
      d3.select('#slider-svg').call(yearSlider);

      


      // Chart
      // TODO: This is temporary. Need to separate  it into chart manager 
      // and data manager modules.
      // NVD3 may not be able to produce time series chart. See issue
      // https://github.com/novus/nvd3/issues/145#issuecomment-76990255
      var chartWidth = $('#d3-canvas').width();
      var chartHeight = 500;
      var margin = {top: 20, right: 60, bottom: 30, left: 40},
      chartWidth = chartWidth - margin.left - margin.right,
      chartHeight = chartHeight - margin.top - margin.bottom;
       
      var parseDate = d3.time.format("%Y").parse;
       
      var x = d3.time.scale()
          .range([0, chartWidth]);
       
      var y = d3.scale.linear()
          .rangeRound([chartHeight, 0]);
       
      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom")
          .tickSize(-chartHeight, 0)
          .tickPadding(6);
       
      var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          .tickSize(chartWidth)
          .tickPadding(6)
          .tickFormat(function(d) { return d + " °C"; });
       
      //Color scale to plot different lines
      var color = d3.scale.ordinal()
                .range(["#636769","#AAB3B6","6E7476"]);
       
      var line = d3.svg.line()
          .interpolate("cardinal")
          .x(function(d) { return x(d.label); })
          //.y(function(d) { return y(d.tavg); });
          .y(function(d) { return y(d.value); });
       
      var svg = d3.select("#d3-canvas").append("svg")
          .attr("width", chartWidth + margin.left + margin.right)
          .attr("height", chartHeight + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + chartWidth + ",0)");

      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + chartHeight + ")");
 
      svg.append("path")
        .attr("class", "line")
        .attr("clip-path", "url(#clip)");

      d3.csv("./data/Sacramento_yearlyAvg.csv", function(error, data) {
  
        //For each row format the values to date or number
        data.forEach(function(d) {
          d.date = parseDate(d.date);
        });
       
        //From header row create list varNames that holds names
        //of columns (series) to plot
        var labelVar = 'date';
      /*  var varNames = d3.keys(data[0])
          .filter(function (key) { 
            return key !== labelVar;
          });*/
        //For now plot only tavg
        var varNames = ['tavg'];
       
        //Set color domain
        color.domain(varNames);
       
        //Read each column to a series array
        var seriesData = varNames.map(function (name) {
          return {
            name: name,
            values: data.map(function (d) {
              return {name: name, label: d[labelVar], value: +d[name]};
            })
          };
        });
        console.log("seriesData", seriesData);
       
        //Set x axis domain
        x.domain(d3.extent(data, function(d) { return d.date; }));
        //Set y axis domain
        //y.domain([d3.min(data, function(d) { return d.tmin; }), d3.max(data, function(d) { return d.tmax; })]);
        y.domain([
          d3.min(seriesData, function (c) { 
            return d3.min(c.values, function (d) { return d.value; });
          }),
          d3.max(seriesData, function (c) { 
            return d3.max(c.values, function (d) { return d.value; });
          })
        ]);
       
        var tip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([-10, 0])
          .html(function(d) {
            return "Average temperature for year " + d.label.getFullYear() + " was " + d.value.toFixed(2) + " °C";
          })
       
        //zoom.x(x);
       
        //svg.select("path.line").data([data]);
        var series = svg.selectAll(".series")
                  .data(seriesData)
                .enter().append("g")
                  .attr("class", "series");
       
        svg.select("g.x.axis").call(xAxis);
        svg.select("g.y.axis").call(yAxis);
       
        svg.call(tip);
        
        series.append("path")
              .attr("class", "line")
              .attr("d", function (d) { return line(d.values); });
      /*        .style("stroke", function (d) { return color(d.name); })
              .style("stroke-width", "4px")
              .style("fill", "none");*/
       
       
        series.selectAll(".point")
                .data(function (d) { return d.values; })
                .enter().append("circle")
                 .attr("class", "point")
                 .attr("cx", function (d) { return x(d.label); })
                 .attr("cy", function (d) { return y(d.value); })
                 .attr("r", "3px")
                 .style("fill", function (d) { return color(d.name); })
                 .on("mouseover", tip.show )
                 .on("mouseout",  tip.hide)
      //draw();
     
     
    });



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
        var geojson = featureCollection[0];

        // Update query params and redraw charts
      
      });





      // TIME SLIDER  INTERACTIONS

      // Fetch new raster tiles from holos
      yearSlider.on('brushed', function(d){
        console.log(d);
        var month = d;
        var year = d;
      });

      // Update date in upper right corner




  





  });


});