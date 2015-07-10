define([
  'd3',
  './config'
], function (d3, config) {
  //Private variables
  var fromKelvin = function(k) { return k - 273.15 };

  var tasmax = {
    name: 'tasmax',
    display_name: 'Average Maximum Temperature',
    desc: 'Monthly mean of the daily-maximum near-surface air temperature',
    units: '°C',
    convert: fromKelvin
  };
  var tasmin = {
    name: 'tasmin',
    display_name: 'Average Minimum Temperature',
    desc: 'Monthly mean of the daily-minimum near-surface air temperature',
    units: '°C',
    convert: fromKelvin
  };
  var precip = {
    name: 'pr',
    display_name: 'Precipitation',
    desc: 'Precipitation at surface; includes both liquid and solid phases from all types of clouds (both large-scale and convective)',
    units: 'kg m-2 s-1',
    convert: function(val) { return val; }
  };

  var _opts = {};

  _opts.models = {
    'gfdl-esm2m': {
      name: 'gfdl-esm2m',
      display_name: 'GFDL-ESM2M',
      desc: "Earth System Model developed by NOAA's Geophysical Fluid Dynamics Laboratory"
    },
    'ensemble': {
      name: 'ens-avg',
      display_name: 'Ensemble',
      desc: 'Ensemble statistics calculated for each RCP from all model runs available'
    }
  };

  _opts.scenarios = {
    'rcp60': {
      name: 'rcp60',
      display_name: 'RCP6.0',
      desc: 'Representative Concentration Pathways describe ' +
        'future greenhouse gas concentration (not emissions) trajectories. ' +
        'In RCP6.0, emissions peak around 2080, then decline.'
    }
  };

  _opts.climatevars = {
    tasmax: tasmax,
    tasmin: tasmin,
    pr: precip
  };

  // Private local variables for tiles
  var _climatevar = tasmax;
  var _scenario = 'rcp26';
  var _model = _opts.models.ensemble.name;
  var _date = new Date('2006-01-16');

  _opts.timeFormat = d3.time.format('%Y-%m-16');
  _opts.timeScale = d3.time.scale()
    .domain([_date, new Date('2099-12-16')]);

  var tiles = {};

  // Public functions
  tiles.getOpts = function() {
    return _opts;
  };

  tiles.getSeriesName = function() {
    return [
      _climatevar.name,
      _model,
      'amon',
      _scenario
    ].join('_');
  }

  tiles.getURL = function() {
    return config.env().tileURL + this.getSeriesName() +
      '-' + _opts.timeFormat(_date) + '/{z}/{x}/{y}/';
  };

  tiles.getDataURL = function() {
    return config.env().apiEndpoint + 'series/' + this.getSeriesName() +
      '/2070-01-16/2099-12-31/';
  };

  // Getter/setters for modifying tile object
  tiles.model = function(_) {
    if (!arguments.length) return _model;
    _model = _;
    return this;
  };

  tiles.scenario = function(_) {
    if (!arguments.length) return _scenario;
    _scenario = _;
    return this;
  };

  tiles.climatevar = function(_) {
    if (!arguments.length) return _climatevar;
    _climatevar = $.isPlainObject(_) ? _ : _opts[_];
    return this;
  };

  tiles.date = function(_) {
    if (!arguments.length) return _date;
    _date = _;
    return this;
  };

  tiles.select = function(title) {
    var rcp = title.slice(-3).replace('.', '');
    this.scenario('rcp' + rcp);
    if (title.indexOf('max') > -1) {
      this.climatevar(tasmax);
    } else if (title.indexOf('min') > -1) {
      this.climatevar(tasmin);
    } else {
      this.climatevar(precip);
    }
  };

  tiles.scenarioNumber = function() {
    return (this.scenario().slice(-2) / 10).toFixed(1);
  };

  return tiles;
});
