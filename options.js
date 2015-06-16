module.exports = {
  appDir: 'dataviz',
  baseUrl: 'js/',
  mainConfigFile: 'dataviz/js/common.js',
  dir: 'dataviz-release',
  modules: [
    // First set up the common build layer.
    {
      // module names are relative to baseUrl
      name: 'common',
      // List common dependencies here. Only need to list
      // top level dependencies, 'include' will find
      // nested dependencies.
      include: [
        'jquery',
        'bootstrap',
        'leaflet',
        'leaflet.draw',
        'd3',
        'nv.d3',
        'd3.tip'
      ]
    },

    // Now set up a build layer for each main layer, but exclude
    // the common one. If you're excluding a module, the excludee
    // must appear before the excluder in this file. Otherwise it will
    // get confused.
    {
      name: 'app/main',
      exclude: ['common']
    }
  ]
};