define([
  'd3',
  'd3.tip',
  './holos-config'
], function (d3, tip, config) {
  d3.tip = tip;
  // Chart
  var chartWidth = 700,
      chartHeight = 400;
  var margin = {top: 20, right: 20, bottom: 30, left: 60},
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
    .tickFormat(function(d) { return d.toFixed(2) + ' °C'; });

  var lineColor = '#f37104';

  var line = d3.svg.line()
    .interpolate('cardinal')
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.values); });

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
      return 'Temperature for year ' + d.date.getFullYear() +
        ' was ' + d.values.toFixed(2) + ' °C';
    });
  svg.call(tip);

  var params = {
    stat: 'mean',
    page_size: 360
  };
  var chart = {};
  var chartURL = config.env().apiEndpoint;
  var elem = $('#chartModal');

  chart.draw = function(series) {
    var url = chartURL + 'series/' + series + '/2070-01-16/2099-12-31/';
    $.getJSON(url, params, function(data, error) {
      var data = data.results;

      data.forEach(function(d) {
        d.date = parseDate(d.event);
        d.image = +d.image;
      });
      var annual = d3.nest()
        .key(function(d) { return d.date.getFullYear() ;})
        .rollup(function(d) {
          return fromKelvin(d3.mean(d, function(g) { return g.image; }));
        }).entries(data);
      annual.forEach(function(d) {
        d.date = new Date(d.key, 0, 1);
      });

      //Set x axis domain
      x.domain(d3.extent(annual, function(d) { return d.date; }));
      //Set y axis domain
      y.domain(d3.extent(annual, function(d) { return d.values; }));

      svg.select('g.x.axis').call(xAxis);
      svg.select('g.y.axis').call(yAxis);

      var lines = svg.selectAll('.line')
        .data([annual])
        .attr('class', 'line');
      // transition from previous paths to new paths
      lines.transition().duration(1500)
        .attr('d', line)
        .style('stroke', lineColor);
      lines.enter().append('path')
        .attr('class', 'line')
        .attr('d', line)
        .style('stroke', lineColor);
      lines.exit().remove();

      var circles = svg.selectAll('.point')
        .data(annual, function (d) { return d.values; });
      circles.enter().append('circle')
        .attr('class', 'point')
        .attr('cx', function (d) { return x(d.date); })
        .attr('cy', function (d) { return y(d.values); })
        .attr('r', '3px')
        .style('fill', function (d) { return d3.rgb(lineColor).brighter(); })
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
