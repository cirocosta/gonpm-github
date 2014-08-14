'use strict';

var JSONStream = require('JSONStream')
	,	map = require('map-stream')
	,	request = require('request')
	,	Transform = require('stream').Transform
	,	url = require('url');

function Validate () {
	if (!(this instanceof Validate))
		return new Validate();

	Transform.call(this);
}

require('util').inherits(Validate, Transform);

Validate.prototype._transform = function (c, e, cb) {
	try {
		JSON.parse(c.toString('utf8'));
		this.push(c);
	} catch (er) {
		return cb(er);
	}

	return cb();
};

exports.search = function(pkg) {
	if (!pkg) throw new Error('A package name must be specified');

	var url = 'http://registry.npmjs.org/' + pkg;

	return request.get({uri: url});
};

exports.resolve = function (str, cb) {
	var resolved = false;

	str
		.pipe(Validate())
		.on('error', function (err) { cb(err);})
		.pipe(JSONStream.parse([function (a) {
			return a === 'repository' || a === 'homepage' || a === 'error';
		}]))
		.pipe(map(function (data, callback) {
			if (resolved) return;

			var data = data.url || data;
			var parsed = url.parse(data);

			if (parsed.host !== 'github.com' || !parsed.host)
				cb(new Error('Couldn\'t find the repository.'));

			resolved = true;

			cb(null, 'https://' + (parsed.host + parsed.path).replace(/\.git$/,''));
		}));
}
