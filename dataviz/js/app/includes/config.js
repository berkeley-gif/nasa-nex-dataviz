define(function () {
  var _env = 'development';

	var config = {
		development : {
			apiEndpoint : 'https://dev-ecoengine.berkeley.edu/api/',
			tileURL : 'https://dev-ecoengine.berkeley.edu/api/tiles/'
		},
		production : {
			apiEndpoint : 'https://ecoengine.berkeley.edu/api/',
			tileURL : 'https://ecoengine.berkeley.edu/api/tiles/'
		}
	};

  config.env = function(_) {
    if (!arguments.length) return config[_env];
    _env = _;
    return config[_env];
  };

	return config;
});
