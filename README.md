# eidetic

Eidetic is a NodeJS module that will cache JS values in memory. Features of the module include:

* A configurable cache size with intelligent removal of items when the size is full.
* An optional sliding expiration per cached item
* Provides stats including cache hits, misses, and current number of items in the cache
* 100% unit test coverage

[![Build Status](https://secure.travis-ci.org/mac-/eidetic.png)](http://travis-ci.org/mac-/eidetic)
[![Coverage Status](https://coveralls.io/repos/mac-/eidetic/badge.png)](https://coveralls.io/r/mac-/eidetic)
[![NPM version](https://badge.fury.io/js/eidetic.png)](http://badge.fury.io/js/eidetic)
[![Dependency Status](https://david-dm.org/mac-/eidetic.png)](https://david-dm.org/mac-/eidetic)

[![NPM](https://nodei.co/npm/eidetic.png?downloads=true&stars=true)](https://nodei.co/npm/eidetic/)

## Contributing

This module makes use of a `Makefile` for building/testing purposes. After obtaining a copy of the repo, run the following commands to make sure everything is in working condition before you start your work:

	make install
	make test

Before committing a change to your fork/branch, run the following commands to make sure nothing is broken:

	make test
	make test-cov

Don't forget to bump the version in the `package.json` using the [semver](http://semver.org/spec/v2.0.0.html) spec as a guide for which part to bump. Submit a pull request when your work is complete.

***Notes:***
* Please do your best to ensure the code coverage does not drop. If new unit tests are required to maintain the same level of coverage, please include those in your pull request.
* Please follow the same coding/formatting practices that have been established in the module.

## Installation

	npm install eidetic

## Usage

The put method is used to store a value for a given key in the cache:

	put(key:String, value:*, [durationSeconds:Number], [useSlidingExpiration:Boolean])

* key - required, a unique string that is used to access the value
* value - required, the value to store in the cache
* durationSeconds - optional (default is 1), the number of seconds to hold the value in the cache. If this is set to `0` AND there is already a value stored at the specified key, the value is updated without modifying the TTL.
* useSlidingExpiration - optional (default is false), whether or not to refresh the expiration on a cache hit
* returns true if the put was successful, false otherwise

The get method is used to retrieve values from the cache:

	get(key:String)

* key - required, a unique string that is used to access the value
* returns the JS object that was stored with the corresponding key, or undefined if no entry was found

The del method is used to remove a specific item from the cache:

	del(key:String)

* key - required, a unique string that is used to access the value
* returns true if there was an entry that was successfully removed from the cache

The ttl method is used to get the number of seconds until a specific item expires in the cache:

	ttl(key:String)

* key - required, a unique string that is used to access the value
* returns a number representing the number of seconds until the item expires

The clear method is used to empty the entire cache:

	clear()

The following methods can be called to get stats on the cache:

	hits()
	misses()
	currentSize()

The following are publically available properties:

	maxSize (Number, defaults to 500) - The max number of items that can live in the cache
	canPutWhenFull (Boolean, defaults to false) - When trying to put to a full cache, if set to true, eidetic will remove the least recently used entry to  make room for the one you are currently storing. If set to false, the storing of the entry will fail.

Valid options to pass to the constructor:

	maxSize (see above)
	canPutWhenFull (see above)
	logger (an instance of your own logging object)

Here is an example:

	var Cache = require('eidetic');
	var options = {
		maxSize: 100,
		canPutWhenFull: true
	};
	var cache = new Cache(options);

	cache.put('key', {my: 'obj'}, 60, true);

	var cachedValue = cache.get('key'); // {my: 'obj'}
	cache.del('key');

	cachedValue = cache.get('key'); // undefined


# License

The MIT License (MIT)
