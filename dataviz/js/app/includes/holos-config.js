define(function () {

	var config = {
		development : {
			apiEndpoint : 'https://dev-ecoengine.berkeley.edu/api/',
			tileserver : 'https://dev-ecoengine.berkeley.edu/api/tiles/'
		},
		production : {
			apiEndpoint : 'https://ecoengine.berkeley.edu/api',
			tileserver : 'https://ecoengine.berkeley.edu/api/tiles/'
		}
	}

	return config;


});