//The build will inline common dependencies into this file.

requirejs.config({
  baseUrl: './js',
  paths: {
    'jquery':                   'vendor/jquery',
    'bootstrap':                'vendor/bootstrap',
    'leaflet':                  'vendor/leaflet-src',
    'leaflet.draw':             'vendor/leaflet.draw-src',
    'd3':                       'vendor/d3',
    'd3.tip':                   'vendor/d3.tip'
  },
  //Remember: only use shim config for non-AMD scripts,
  //scripts that do not already call define(). The shim
  //config will not work correctly if used on AMD scripts,
  shim: {
    'bootstrap': ['jquery'],
    'leaflet': {
      exports: 'L'
    },
    'leaflet.draw': {
      deps: ['leaflet']
    },
    'd3.tip': {
      deps: ['d3'],
      exports: 'd3.tip'
    }
  }
});
