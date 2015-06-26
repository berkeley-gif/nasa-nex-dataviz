define([
  'd3',
  './holos-config'
], function (d3, config) {
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

  var parseDate = d3.time.format('%Y').parse;
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

  var chart = {};
  var chartURL = config.env().apiEndpoint;

  chart.draw = function(params) {
    var url = chartURL + 'series/tasmin_ens-avg_amon_rcp85/2070-01-16/2099-12-31/';
    $.getJSON(url, params, function(data, error) {
      var data = data.results;

      data.forEach(function(d) {
        d.date = Date.parse(d.event);
      });
      //From header row create list varNames that holds names
      //of columns (series) to plot
      var labelVar = 'date';
      //var labelVar = 'event';
      /*  var varNames = d3.keys(data[0])
          .filter(function (key) {
          return key !== labelVar;
          });*/
      var varNames = ['tmax'];
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

      var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
          return 'Average temperature for year ' + d.label.getFullYear() + ' was ' + d.value.toFixed(2) + ' °C';
        })
      //zoom.x(x);

      //svg.select('path.line').data([data]);
      var series = svg.selectAll('.series')
          .data(seriesData)
        .enter().append('g')
          .attr('class', 'series');

      svg.select('g.x.axis').call(xAxis);
      svg.select('g.y.axis').call(yAxis);
      svg.call(tip);

      series.append('path')
        .attr('class', 'line')
        .attr('d', function (d) { return line(d.values); });
      /*        .style('stroke', function (d) { return color(d.name); })
                .style('stroke-width', '4px')
                .style('fill', 'none');*/

      series.selectAll('.point')
          .data(function (d) { return d.values; })
        .enter().append('circle')
          .attr('class', 'point')
          .attr('cx', function (d) { return x(d.label); })
          .attr('cy', function (d) { return y(d.value); })
          .attr('r', '3px')
          .style('fill', function (d) { return color(d.name); })
          .on('mouseover', tip.show )
          .on('mouseout',  tip.hide);
    });
  };
  return chart;
});
