'use strict';

var JSONStream = require('JSONStream')
	,	es = require('event-stream')
	,	request = require('request')
	,	stream = require('stream');

exports.search = function(pkg) {
	if (!pkg) throw new Error('A package name must be specified');

	var url = 'http://registry.npmjs.org/' + pkg;

	return request.get({uri: url});
};

exports.resolve = function (str, cb) {
	str
		.pipe(JSONStream.parse('repository'))
		.pipe(es.map(function (data, callback) {
			if (data.type !== 'git')
				cb(new Error('Couldn\'t find the repository.'));

			cb(null, data.url.replace('.git', ''));
		}));
}
