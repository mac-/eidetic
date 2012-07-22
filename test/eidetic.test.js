var assert = require('assert'),
	Cache = require('../lib-test/Eidetic.js'),
	_ = require('underscore'),
	options = {
		useSlidingExpiration: false,
		maxSize: 500
	},
	testValue = {
		some: 'data',
		someMore: [1,2,3],
		isData: false,
		date: new Date(),
		sub: {
			obj: 'fnord'
		}
	},
	testValue2 = {
		some: 'data1',
	},
	cache;

describe('Eidetic Cache', function() {
	describe('stats', function() {
		
		it('should give accurate stats on the cache', function(done) {

			cache = new Cache({maxSize: 2});
			cache.put('key', testValue);
			var value = cache.get('key');
			value = cache.get('key1');

			assert.strictEqual(cache.hits(), 1, 'The number of cache hits should be 1');
			assert.strictEqual(cache.misses(), 1, 'The number of cache misses should be 1');
			assert.strictEqual(cache.currentSize(), 1, 'The current cache size should be 1');
			done();
		});
	});
	describe('get()', function() {
		
		it('should get a null value when there is no value in the cache', function(done) {

			cache = new Cache();
			var value = cache.get('badKey');

			assert.strictEqual(value, null, 'The value should be null');
			done();
		});

		it('should get the same value from the cache that was put in there', function(done) {

			cache = new Cache();
			cache.put('key', testValue);
			var value = cache.get('key');

			assert(_.isEqual(value, testValue), 'The cached value should be equal to the test value');
			done();
		});

		it('should get the cached value after the original expiration when using a sliding expiration', function(done) {

			cache = new Cache();
			cache.put('key', testValue, 1, true);
			var value;
			setTimeout(function() {
				value = cache.get('key');
				assert(_.isEqual(value, testValue), 'The value should be cached');
				setTimeout(function() {

					value = cache.get('key');
					assert(_.isEqual(value, testValue), 'The value should be cached beyond it\'s original expiration');
					done();

				}, 700);
			}, 500);
		});
	});
	describe('clear()', function() {
		
		it('should clear the entire cache', function(done) {

			cache = new Cache();
			cache.put('key', testValue);
			cache.clear();

			var value = cache.get('key');

			assert.strictEqual(value, null, 'The value should be null');
			done();
		});
	});
	describe('del()', function() {
		
		it('should remove entry from cache', function(done) {

			cache = new Cache();
			cache.put('key', testValue);
			cache.del('key');

			var value = cache.get('key');

			assert.strictEqual(value, null, 'The value should be null');
			done();
		});
	});
	describe('put()', function() {
		it('should throw an error when passing invalid arguments to put()', function(done) {

			cache = new Cache();
			var passed = false;
			try {
				cache.put();
			}
			catch (ex) {
				passed = true;
			}
			assert(passed, 'calling put() with no parmas should throw an error.');

			passed = false;
			try {
				cache.put({}, 1);
			}
			catch (ex) {
				passed = true;
			}
			assert(passed, 'calling put() with invalid key should throw an error.');

			passed = false;
			try {
				cache.put('key', undefined);
			}
			catch (ex) {
				passed = true;
			}
			assert(passed, 'calling put() with invalid value should throw an error.');

			done();
		});

		it('hitting the max cache size on put should remove the least recently used', function(done) {

			cache = new Cache({maxSize: 1});
			cache.put('key', testValue, 10);
			setTimeout(function() {

				cache.put('key1', testValue, 10);

				setTimeout(function() {
					var value = cache.get('key');
					assert.strictEqual(value, null, 'the first cached value should be removed from the cache before it\'s expiration');
					value = cache.get('key1');
					assert(_.isEqual(value, testValue), 'the second cached value should be in the cache still');
					done();
				}, 100);

			}, 10);

		});

		it('insert item with same key twice', function(done) {

			cache = new Cache();
			cache.put('key', testValue, 10);
			cache.put('key', testValue2, 10);

			var value = cache.get('key');
			assert.strictEqual(value, testValue2, 'the first cached value should be overwritten with the second');
			done();

		});

		it('cached value should be removed after expiration', function(done) {

			cache = new Cache();
			cache.put('key', testValue, 1);

			setTimeout(function() {
				var value = cache.get('key');
				assert.strictEqual(value, null, 'the cached value should be removed after expiration');
				done();
			}, 1300);

		});

	});

});