eidetic
===

Eidetic is a NodeJS module that will cache JS values in memory. Features of the module include:

* A configurable cache size with intelligent removal of items when the size is full.
* An optional sliding expiration per cached item
* Provides stats including cache hits, misses, and current number of items in the cache
* 100% unit test coverage

[![Build Status](https://secure.travis-ci.org/mac-/eidetic.png)](http://travis-ci.org/mac-/eidetic)

Installation
===
	npm install eidetic

Usage
===

The put method is used to store a value for a given key in the cache:

	put(key:String, value:*, [durationSeconds:Number], [useSlidingExpiration:Boolean])

* key - required, a unique string that is used to access the value
* value - required, the value to store in the cache
* durationSeconds - optional (default is 1), the number of seconds to hold the value in the cache
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
		

License
===
The MIT License (MIT) Copyright (c) 2012 Mac Angell

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


