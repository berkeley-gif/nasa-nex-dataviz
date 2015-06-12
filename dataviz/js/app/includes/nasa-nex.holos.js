define(['d3'], function (require) {

    var tiles = {}

    var models = {
        'gfdl-esm2m': { 
            name: 'gfdl-esm2m',
            display_name: 'GFDL-ESM2M',
            desc: "Earth System Model developed by NOAA's Geophysical Fluid Dynamics Laboratory"
        }
    };

    var scenarios = {
        'rcp60': {
            name: 'rcp60',
            display_name: 'RCP6.0',
            desc: 'Representative Concentration Pathways describe ' +
                  'future greenhouse gas concentration (not emissions) trajectories. ' +
                  'In RCP6.0, emissions peak around 2080, then decline.'
        }
    };

    var climatevars = {
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

    // scale function
    var timeScale = d3.time.scale()
                        .domain([new Date('1950-01-16'), new Date('2100-12-16')])
                        .clamp(true)
                        .nice(d3.time.month);

    var date = '2031-02-16';

    var format = d3.time.format('%Y');

    tiles.opts = {
        models: models,
        scenarios: scenarios,
        climatevars: climatevars,
        period: date
    }

    //'https://dev-ecoengine.berkeley.edu/api/tiles/tasmax_rcp60_r1i1p1_gfdl-esm2m-2031-02-16/{z}/{x}/{y}/';
    tiles.getURL = function (config) {
        return config.climatevar + '_' + config.scenario + '_r1i1p1_' + config.model + '-' + '2031-02-16' + '/{z}/{x}/{y}/';
    }

    return tiles;

});