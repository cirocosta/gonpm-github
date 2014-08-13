'use strict';

var assert = require('assert')
	,	sinon = require('sinon')
	,	request = require('request')
	,	fs = require('fs')
	,	gonpmGithub = require('../lib/index')

	, PATH_SAMPLE = require('path').resolve(__dirname, './sample.json');


describe('gonpmGithub', function() {
	it('be sane', function() {
		assert(!!gonpmGithub);
	});

	describe('search', function() {
		beforeEach(function (done) {
			(sinon.stub(request, 'get'), done());
		});

		afterEach(function (done) {
			(request.get.restore(), done());
		});

		it('throw if no param', function() {
			var throwFn = function () {
				gonpmGithub.search();
			};

			assert.throws(throwFn);
		});

		it('use the correct url', function() {
			gonpmGithub.search('pasquale');

			var expected = 'http://registry.npmjs.org/pasquale';
			var actual = request.get.getCall(0).args[0].uri;

			assert.equal(actual, expected);
		});
	});

	describe('resolve', function() {
		it('find a repository if repository field present', function(done) {
			var file = fs.createReadStream(PATH_SAMPLE);
			var expected = 'https://github.com/cirocosta/pasquale'

			gonpmGithub.resolve(file, function (err, url) {
				if (err) done(err);

				assert.equal(url, expected);
				done();
			});
		});
	});
});
