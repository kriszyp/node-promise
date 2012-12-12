sys = require("sys");
var fs = require('./fs-promise');

// open a file and read it
fs.open("fs-promise.js", 'r').then(function(fd){
  return fs.read(fd, 4096);
}).then(function(args){
  sys.puts(args[0]);
});

// does the same thing
fs.readFile("fs-promise.js").addCallback(sys.puts);

// does the same thing
fs.readFile("fs-promise.js").thenNode(function(err, result) {
	if (err) {
		console.error(err);
	} else {
		console.info('thenNode result success');
	}
});

// forced error
fs.readFile("foobar.js").thenNode(function(err, result) {
	if (err) {
		console.info('thenNode err success');
	} else {
		console.error('err should be passed');
	}
});