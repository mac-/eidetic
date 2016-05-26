var clone = require('clone');

module.exports = function Cache(options) {

	options = options || {};
	var self = this,
		maxDurationSeconds = parseInt('0x7FFFFFFF', 16) / 1000, // setTimeout uses a 32bit integer to store its delay value, so anything above that (24.8551 days) will cause the timeout to execute immediately
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

	this.keys = function() {
		return Object.keys(cachedItems);
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
			return clone(cachedItems[key].value);
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

		durationSeconds = (typeof durationSeconds === 'number') ? Math.max(0, Math.min(maxDurationSeconds, durationSeconds)) : 1; // must be between 0 and 2147483.647 seconds

		var existingTimeoutId;
		if (durationSeconds === 0 && cachedItems.hasOwnProperty(key)) {
			existingTimeoutId = cachedItems[key].timeoutId;
			durationSeconds = cachedItems[key].durationSeconds - Math.ceil((new Date() - cachedItems[key].lastModified) / 1000);
		}

		if (Object.keys(cachedItems).length >= self.maxSize &&
			cachedItems[key] === undefined &&
			!self.canPutWhenFull) {
			logger.log('Max cache size hit, unable to put new cache entry.');
			return false;
		}
		// clear timeout on existing values
		if (cachedItems[key] !== undefined && cachedItems[key].timeoutId !== undefined && !existingTimeoutId) {
			clearTimeout(cachedItems[key].timeoutId);
		}

		cachedItems[key] = {
			value: clone(value),
			durationSeconds: durationSeconds,
			useSlidingExpiration: useSlidingExpiration,
			lastAccessed: new Date(),
			lastModified: new Date(),
			timeoutId: (existingTimeoutId) ? existingTimeoutId : setTimeout(function() {
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

	this.ttl = function(key) {
		if (!cachedItems.hasOwnProperty(key) || !cachedItems[key].timeoutId) {
			return 0;
		}
		var lastDate = (cachedItems[key].useSlidingExpiration) ? cachedItems[key].lastAccessed : cachedItems[key].lastModified;
		return cachedItems[key].durationSeconds - Math.ceil((new Date() - lastDate) / 1000);
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
