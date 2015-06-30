define(['d3'], function (d3) {
  return function(config) {
    var radius = Math.min(config.width, config.height) / 2;
    var tau = 2 * Math.PI;

    var arc = d3.svg.arc()
      .innerRadius(radius * 0.5)
      .outerRadius(radius * 0.7)
      .startAngle(0);

    var svg = d3.select('#d3-canvas > svg')
      .append('g')
        .attr('transform', 'translate(' + config.width / 2 + ',' + config.height / 2 + ')');

    var meter = svg.append('g')
      .attr('class', 'progress-meter');

    var background = meter.append('path')
      .datum({endAngle: tau})
      .attr('class', 'background')
      .attr('d', arc);

    var foreground = meter.append('path')
      .datum({endAngle: .127 * tau})
      .attr('class', 'foreground')
      .attr('d', arc);

    var duration = 1500;

    var progress = {
      isLoading: true
    };

    progress.start = function() {
      foreground.transition()
        .ease('linear')
        .duration(duration)
        .attrTween('transform', function() {
          return d3.interpolate('rotate(0)', 'rotate(360)');
        });
      progress.id = setTimeout(progress.start, duration);
    };

    progress.stop = function() {
      this.isLoading = false;
      clearTimeout(this.id);
      //background.transition().duration(0);
      meter.transition()
        .delay(250)
        .attr('transform', 'scale(0)');
      delete this.id;
    };

    progress.reset = function() {
      this.isLoading = true;
      meter.attr('transform', null);
      return this;
    };

    return progress;
  };
});
