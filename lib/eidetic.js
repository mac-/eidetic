module.exports = function Cache(options) {

	options = options || {};
	var self = this,
		_ = require('underscore'),
		clone = require('clone'),
		hits = 0,
		total = 0,
		logger = options.logger || {log:function(){},trace:function(){},debug:function(){},info:function(){},warn:function(){},error:function(){}},
		cachedItems = {};

	// private methods
	var removeLeastRecentlyUsed = function() {
		var oldestAccessDate = new Date(),
			oldestKey = '';
		for (var prop in cachedItems) {
			if (cachedItems.hasOwnProperty(prop)) {
				if (cachedItems[prop].lastAccessed.getTime() <= oldestAccessDate.getTime()) {
					oldestAccessDate = cachedItems[prop].lastAccessed;
					oldestKey = prop;
				}
			}
		}
		if (oldestKey.length > 0) {
			clearTimeout(cachedItems[oldestKey].timeoutId);
			delete cachedItems[oldestKey];
		}
	};

	// public props
	this.maxSize = options.maxSize || 500;

	this.canPutWhenFull = options.canPutWhenFull || false;

	// public methods
	this.hits = function() {
		return hits;
	};

	this.misses = function() {
		return (total - hits);
	};

	this.currentSize = function() {
		return Object.keys(cachedItems).length;
	};

	this.get = function(key) {
		logger.log('Attempting to get entry from cache under key: ' + key);
		total++;
		if (cachedItems.hasOwnProperty(key)) {
			if (cachedItems[key].useSlidingExpiration) {
				clearTimeout(cachedItems[key].timeoutId);
				cachedItems[key].timeoutId = setTimeout(function() {
					self.del(key);
				}, cachedItems[key].durationSeconds * 1000);
			}
			cachedItems[key].lastAccessed = new Date();
			logger.log('Cache hit!');
			hits++;
			return cachedItems[key].value;
		}
		logger.log('Cache miss!');
		return;
	};

	this.put = function(key, value, durationSeconds, useSlidingExpiration) {
		logger.log('Attempting to put entry into cache under key: ' + key);
		if (typeof(key) !== 'string' || key.length < 1) {
			throw new Error('Missing or invalid parameter: key');
		}
		if (typeof(value) === 'undefined') {
			throw new Error('Missing or invalid parameter: value');
		}

		durationSeconds = (durationSeconds) ? Math.max(1, durationSeconds) : 1;
		var expires = new Date();
		expires.setTime(expires.getTime() + durationSeconds * 1000);
		
		if (Object.keys(cachedItems).length >= self.maxSize &&
			cachedItems[key] === undefined &&
			!self.canPutWhenFull) {
			logger.log('Max cache size hit, unable to put new cache entry.');
			return false;
		}
		// clear timeout on existing values
		if (cachedItems[key] !== undefined && cachedItems[key].timeoutId !== undefined) {
			clearTimeout(cachedItems[key].timeoutId);
		}
		
		cachedItems[key] = {
			value: clone(value),
			durationSeconds: durationSeconds,
			useSlidingExpiration: useSlidingExpiration,
			lastAccessed: new Date(),
			timeoutId: setTimeout(function() {
				self.del(key);
			}, durationSeconds * 1000)
		};

		if (Object.keys(cachedItems).length > self.maxSize) {
			logger.log('Max cache size hit, removing the item that was least recently used.');
			process.nextTick(removeLeastRecentlyUsed);
		}
		return true;
	};

	this.del = function(key) {
		logger.log('Attempting to remove cached item with key of: ' + key);
		var wasDeleted = false;
		if (cachedItems[key]) {
			if (cachedItems[key].timeoutId !== undefined) {
				clearTimeout(cachedItems[key].timeoutId);
			}
			delete cachedItems[key];
			wasDeleted = true;
		}
		return wasDeleted;
	};

	this.clear = function() {
		logger.log('Clearing entire cache');
		for (var prop in cachedItems) {
			if (cachedItems.hasOwnProperty(prop)) {
				clearTimeout(cachedItems[prop].timeoutId);
			}
		}
		cachedItems = {};
	};
};
