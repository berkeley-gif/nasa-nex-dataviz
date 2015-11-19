define(function () {
  var envs = {
    development: {
      apiEndpoint : 'https://dev-ecoengine.berkeley.edu/api/',
      tileURL : 'https://dev-ecoengine.berkeley.edu/api/tiles/'
    },
    production: {
      apiEndpoint : 'https://ecoengine.berkeley.edu/api/',
      tileURL : 'https://ecoengine.berkeley.edu/api/tiles/'
    }
  };

  var Config = function() {
    this.env('production');
  };

  Config.prototype.env = function(_) {
    if (!arguments.length) return this._env;
    this._env = envs[_];
    return this;
  };

  // Singleton
  return new Config();
});
