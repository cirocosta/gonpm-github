'use strict';

var JSONStream = require('JSONStream')
	,	map = require('map-stream')
	,	request = require('request')
	,	url = require('url');


exports.search = function(pkg) {
	if (!pkg) throw new Error('A package name must be specified');

	var url = 'http://registry.npmjs.org/' + pkg;

	return request.get({uri: url});
};

exports.resolve = function (str, cb) {
	var resolved = false;

	str
		.pipe(JSONStream.parse([function (a) {
			return a === 'repository' || a === 'homepage';
		}]))
		.pipe(map(function (data, callback) {
			if (resolved) return;

			var data = data.url || data;
			var parsed = url.parse(data);

			if (!parsed.host ==='github.com')
				cb(new Error('Couldn\'t find the repository.'));

			resolved = true;

			cb(null, 'https://' + (parsed.host + parsed.path).replace('.git',''));
		}));
}
