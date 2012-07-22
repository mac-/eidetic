clean:
	npm cache clean && rm -rf node_modules/*

install:
	npm install

test:
	./test/test.sh

coverage:
	# To install jscoverage:
	#  git clone https://github.com/visionmedia/node-jscoverage.git
	#  cd node-jscoverage
	#  ./configure && make
	#  sudo make install
	
	#clean first
	rm -rf coverage && mkdir coverage
	#build the instrumented code with jscoverage
	jscoverage lib coverage/lib-instrumented
	#create the symlink that the unit tests are expecting
	ln -fns ./coverage/lib-instrumented/ ./lib-test
	#run the tests against the instrumented code
	./node_modules/.bin/mocha -R html-cov > ./coverage/coverage.html
	# (MacOSX) open the coverage result in the browser
	open "file://${CURDIR}/coverage/coverage.html" &

.PHONY: test coverage
