/**
* Node fs module that returns promises
*/

var fs = require("fs"),
  convertNodeAsyncFunction = require("promise").convertNodeAsyncFunction;
for(var i in fs) {
  exports[i] = convertNodeAsyncFunction(fs[i]);
}