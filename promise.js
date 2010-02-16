/**
* Convenience functions for promises, much of this is taken from Tyler Close's ref_send 
* and Kris Kowal's work on promises.
* Dual licensed under BSD and AFL
*/
 
/**
 * Registers an observer on a promise.
 * @param value     promise or value to observe
 * @param resolvedCallback function to be called with the resolved value
 * @param rejectCallback  function to be called with the rejection reason
 * @param progressCallback  function to be called when progress is made
 * @return promise for the return value from the invoked callback
 */
exports.whenPromise = function(value, resolvedCallback, rejectCallback, progressCallback){
  try{
    var returnValue;
    if (value && (typeof value.addCallback === "function" || typeof value.then === "function")){
      if (typeof value.addCallback === "function"){
        value.addCallback(function(value){
          resolvedCallback(value);
        });
        value.addErrback(rejectCallback);
        var deferred = new process.Promise();
        deferred.resolve(value);
        return deferred.promise;
      }
      else {
        value = value.then(resolvedCallback, rejectCallback, progressCallback);
      }
    }
    else{
      value = resolvedCallback(value);
    }
    if(value && typeof value.then === "function"){
      return value;
    }
    var deferred = new process.Promise();
    deferred.resolve(value);
    return deferred;
  }
  catch(e){
    var deferred = new process.Promise();
    deferred.reject(e);
    return deferred.promise;
  }
};
/**
 * Registers an observer on a promise.
 * @param value     promise or value to observe
 * @param resolvedCallback function to be called with the resolved value
 * @param rejectCallback  function to be called with the rejection reason
 * @param progressCallback  function to be called when progress is made
 * @return promise for the return value from the invoked callback or the value if it
 * is a non-promise value
 */
exports.when = function(value, resolvedCallback, rejectCallback, progressCallback){
  if(value && (typeof value.addCallback === "function" || typeof value.then === "function")){
    return exports.whenPromise(value, resolvedCallback, rejectCallback, progressCallback);
  }
  return resolvedCallback(value);
};



/**
 * Waits for the given promise to finish, blocking (and executing other events)
 * if necessary to wait for the promise to finish. If target is not a promise
 * it will return the target immediately. If the promise results in an reject,
 * that reject will be thrown.
 * @param target   promise or value to wait for.
 * @return the value of the promise;
 */
exports.wait = process.Promise.wait;

/**
 * Takes an array of promises and returns a promise that that is fulfilled once all
 * the promises in the array are fulfilled
 * @param array  The array of promises
 * @return the promise that is fulfilled when all the array is fulfilled
 */
exports.all = function(array){
  var deferred = defer();
  if(!(array instanceof Array)){
    array = Array.prototype.slice.call(arguments);
  }
  var fulfilled, length = array.length;
  var results = [];
  array.forEach(function(promise, index){
    exports.when(promise, function(value){
      results[index] = value;
      fulfilled++;
      if(fulfilled === length){
        deferred.resolve(results);
      }
    },
    deferred.reject);
  });
  return deferred.promise;
};

/**
 * Takes an array of promises and returns the first promise that that is fulfilled
 * the promises in the array are fulfilled
 * @param array  The array of promises
 * @return the promise that is fulfilled when all the array is fulfilled
 */
exports.first = function(array){
  var deferred = defer();
  if(!(array instanceof Array)){
    array = Array.prototype.slice.call(arguments);
  }
  var fulfilled;
  array.forEach(function(promise, index){
    exports.when(promise, function(value){
      if (!done) {
        fulfilled = true;
        deferred.resolve(value);
      }  
    },
    deferred.reject);
  });
  return deferred.promise;
};
