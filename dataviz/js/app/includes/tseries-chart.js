define([
  'd3',
  'd3.tip',
  './holos-config'
], function (d3, tip, config) {
  d3.tip = tip;
  // Chart
  // TODO: This is temporary. Need to separate  it into chart manager
  // and data manager modules.
  // NVD3 may not yet provide enough flexibility to
  // use time scale. See issues:
  // https://github.com/novus/nvd3/issues/145#issuecomment-76990255
  // https://github.com/novus/nvd3/pull/856
  // d3.chart looks more promising, smaller framework. Write your
  // own charting code, but use their helper functions.
  var chartWidth = 700,
      chartHeight = 400;
  var margin = {top: 20, right: 60, bottom: 30, left: 40},
      chartWidth = chartWidth - margin.left - margin.right,
      chartHeight = chartHeight - margin.top - margin.bottom;

  var parseDate = d3.time.format('%Y-%m-%d').parse;
  var fromKelvin = function(k) { return k - 273.15 };

  var x = d3.time.scale()
    .range([0, chartWidth]);

  var y = d3.scale.linear()
    .rangeRound([chartHeight, 0]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom')
    .tickSize(-chartHeight, 0)
    .tickPadding(6);

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient('left')
    .tickSize(chartWidth)
    .tickPadding(6)
    .tickFormat(function(d) { return d + ' °C'; });

  //Color scale to plot different lines
  var color = d3.scale.ordinal()
    .range(['#636769','#AAB3B6','6E7476']);

  var line = d3.svg.line()
    .interpolate('cardinal')
    .x(function(d) { return x(d.label); })
    //.y(function(d) { return y(d.tavg); });
    .y(function(d) { return y(d.value); });

  var svg = d3.select('#d3-canvas').append('svg')
    .attr('width', chartWidth + margin.left + margin.right)
    .attr('height', chartHeight + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  svg.append('g')
    .attr('class', 'y axis')
    .attr('transform', 'translate(' + chartWidth + ',0)');

  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + chartHeight + ')');

  svg.append('path')
    .attr('class', 'line')
    .attr('clip-path', 'url(#clip)');

  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      console.log(d);
      return 'Temperature for year ' + d.label.getFullYear() +
        ' was ' + d.value.toFixed(2) + ' °C';
    });
  svg.call(tip);

  var params = {
    stat: 'mean',
    page_size: 24
    //page_size: 120
  };
  var chart = {};
  var chartURL = config.env().apiEndpoint;
  var elem = $('#chartModal');

  chart.draw = function() {
    var url = chartURL + 'series/tasmin_ens-avg_amon_rcp85/2070-01-16/2099-12-31/';
    $.getJSON(url, params, function(data, error) {
      var data = data.results;

      data.forEach(function(d) {
        d.date = parseDate(d.event);
      });
      //From header row create list varNames that holds names
      //of columns (series) to plot
      var labelVar = 'date';
      //var labelVar = 'event';
      /*  var varNames = d3.keys(data[0])
          .filter(function (key) {
          return key !== labelVar;
          });*/
      //var varNames = ['tmax'];
      var varNames = ['tasmin'];
      //Set color domain
      color.domain(varNames);
      //Read each column to a series array
      var seriesData = varNames.map(function (name) {
        return {
          name: name,
          values: data.map(function (d) {
            return {name: name, label: d[labelVar], value: fromKelvin(d.image)};
          })
        };
      });
      console.log('seriesData', seriesData);

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

      svg.select('g.x.axis').call(xAxis);
      svg.select('g.y.axis').call(yAxis);

      var lines = svg.selectAll('.line')
        .data(seriesData)
        .attr('class','line');
      // transition from previous paths to new paths
      lines.transition().duration(1500)
        .attr('d', function (d) { return line(d.values); })
        .style('stroke', function(){
          return '#'+Math.floor(Math.random()*16777215).toString(16);
        });
      lines.enter().append('path')
        .attr('class','line')
        .attr('d', function (d) { return line(d.values); })
        .style('stroke', function(){
          return '#'+Math.floor(Math.random()*16777215).toString(16);
        });
      lines.exit().remove();

      var circles = svg.selectAll('.point')
        .data(seriesData[0].values, function (d) { return d.value; });
      circles.enter().append('circle')
        .attr('class', 'point')
        .attr('cx', function (d) { return x(d.label); })
        .attr('cy', function (d) { return y(d.value); })
        .attr('r', '3px')
        .style('fill', function (d) { return d3.rgb(color(d.name)).brighter(); })
        .on('mouseover', tip.show)
        .on('mouseout',  tip.hide);
      circles.exit().remove();

      elem.modal('show');
    });
  };


  chart.params = function(_) {
    if (!arguments.length) return chart;
    $.extend(params, _);
    return chart;
  };

  return chart;
});
