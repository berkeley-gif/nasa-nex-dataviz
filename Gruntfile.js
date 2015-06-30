/*global module:false*/
'use strict';

var opt = require('./options');

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({

    clean: {
      release: 'dataviz-release'
    },

    requirejs: {
      compile: {
        options: opt
      }
    },

    cssmin: {
      compile: {
        files: [{
          expand: true,
          cwd: 'dataviz-release/css',
          src: '*.css',
          dest: 'dataviz-release/css',
        }]
      }
    }

  });

  // Load tasks from NPM
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Default task.
  grunt.registerTask('default', ['clean', 'requirejs', 'cssmin']);

};
