#!/bin/sh

ln -fns ./lib/ ./lib-test

./node_modules/.bin/jshint lib/* --config test/jshint/config.json
if [ $? -ne 0 ] ; then exit $? ; fi

./node_modules/.bin/mocha -R spec
if [ $? -ne 0 ] ; then exit $? ; fi

echo "All tests pass!"