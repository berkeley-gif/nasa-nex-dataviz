define([
  'd3',
  './holos-config'
], function (d3, config) {

  return function () {
    //Private variables
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
      'tasmax': {
        name: 'tasmax',
        display_name: 'Average Maximum Temperature',
        desc: 'Monthly mean of the daily-maximum near-surface air temperature',
        units: 'K'
      },
      'tasmin':{
        name: 'tasmin',
        display_name: 'Average Minimum Temperature',
        desc: 'Monthly mean of the daily-minimum near-surface air temperature',
        units: 'K'
      },
      'precip':{
        name: 'precip',
        display_name: 'Precipitation',
        desc: 'Precipitation at surface; includes both liquid and solid phases from all types of clouds (both large-scale and convective)',
        units: 'kg m-2 s-1'
      }
    };

    // Private local variables for tiles
    var _climatevar = 'tasmax';
    var _scenario = 'rcp26';
    var _model = 'ens-avg';
    var _date = new Date('2006-01-16');
    var tiles = {
      climatevar: _climatevar,
      scenario: _scenario,
      model: _model,
      date: _date
    };

    _opts.timeFormat = d3.time.format('%Y-%m-16');
    _opts.timeScale = d3.time.scale()
      .domain([_date, new Date('2099-12-16')]);

    // Public functions
    tiles.getOpts = function() {
      return _opts;
    };

    tiles.getSeriesName = function() {
      return [
        _climatevar,
        _model,
        'amon',
        _scenario
      ].join('_');
    }

    tiles.getURL = function() {
      return config.env().tileURL + tiles.getSeriesName() +
        '-' + _opts.timeFormat(_date) + '/{z}/{x}/{y}/';
    };

    // Getter/setters for modifying tile object
    tiles.model = function(_) {
      if (!arguments.length) return _model;
      _model = _;
      return tiles;
    };

    tiles.scenario = function(_) {
      if (!arguments.length) return _scenario;
      _scenario = _;
      return tiles;
    };

    tiles.climatevar = function(_) {
      if (!arguments.length) return _climatevar;
      _climatevar = _;
      return tiles;
    };

    tiles.date = function(_) {
      if (!arguments.length) return _date;
      _date = _;
      //console.log('date from slides', _date);
      return tiles;
    };

    tiles.select = function(title) {
      var rcp = title.slice(-3).replace('.', '');
      if (title.indexOf('max') > -1) {
        var cvar = 'tasmax';
      } else if (title.indexOf('min') > -1) {
        var cvar = 'tasmin';
      } else {
        var cvar = 'pr';
      }
      tiles.climatevar(cvar);
      tiles.scenario('rcp' + rcp);
    };

    tiles.scenarioNumber = function() {
      return (tiles.scenario().slice(-2) / 10).toFixed(1);
    }

    return tiles;
  };
});
