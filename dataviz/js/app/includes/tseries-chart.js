define([
  'd3',
  'd3.tip',
  './progress'
], function (d3, tip, progress) {
  d3.tip = tip;
  // Chart
  var chartWidth = 700,
      chartHeight = 400;
  var margin = {top: 20, right: 20, bottom: 30, left: 60},
      chartWidth = chartWidth - margin.left - margin.right,
      chartHeight = chartHeight - margin.top - margin.bottom;

  var lineColor = '#f37104',
      $elModal = $('#chartModal'),
      parseDate = d3.time.format('%Y-%m-%d').parse;

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
    .tickPadding(6);

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
  svg.call(tip);

  var params = {
    stat: 'mean',
    page_size: 360
  };

  var p = progress({
    width: chartWidth,
    height: chartHeight
  });

  var chart = {data: null};

  chart.adjustDomains = function() {
    //Set x axis domain
    x.domain(d3.extent(this.data, function(d) { return d.date; }));
    //Set y axis domain
    y.domain(d3.extent(this.data, function(d) { return d.values; }));
  };

  chart.draw = function(series) {
    $elModal.modal('show');
    p.reset().start();
    var _this = this,
        climvar = series.climatevar();

    $.getJSON(series.getDataURL(), params, function(data, error) {
      p.stop();

      var data = data.results;
      data.forEach(function(d) {
        d.date = parseDate(d.event);
        d.image = +d.image;
      });

      var annual = d3.nest()
        .key(function(d) { return d.date.getFullYear() ;})
        .rollup(function(d) {
          return climvar.convert(d3.mean(d, function(g) {
            return g.image;
          }));
        }).entries(data);
      annual.forEach(function(d) {
        d.date = new Date(d.key, 0, 1);
      });
      _this.data = annual;

      _this.adjustDomains();
      yAxis.tickFormat(function(d) { return d.toFixed(2) + ' ' + climvar.units; });
      tip.html(function(d) {
        return 'Year ' + d.date.getFullYear() +
          ': ' + d.values.toFixed(2) + ' ' + climvar.units;
      });
      svg.select('g.x.axis').call(xAxis);
      svg.select('g.y.axis').call(yAxis);

      _this.drawLines();
      _this.drawPoints();
    });
  };

  chart.drawLines = function() {
    var lines = svg.selectAll('.line')
      .data([this.data])
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
  };

  chart.drawPoints = function() {
    var circles = svg.selectAll('.point')
      //.data(annual, function (d) { return d.values; });
      .data(this.data, function (d) { return d.values; });
    circles.enter().append('circle')
      .attr('class', 'point')
      .attr('cx', function (d) { return x(d.date); })
      .attr('cy', function (d) { return y(d.values); })
      .attr('r', '3px')
      .style('fill', function (d) { return d3.rgb(lineColor).brighter(); })
      .on('mouseover', tip.show)
      .on('mouseout',  tip.hide);
    circles.exit().remove();
  };

  chart.params = function(_) {
    if (!arguments.length) return params;
    $.extend(params, _);
    return this;
  };

  return chart;
});
