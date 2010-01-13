// this is a promise implementation for Node, based on the CommonJS spec for promises: 
// http://wiki.commonjs.org/wiki/Promises
// Promise are chainable, immutable (once resolved), cancelable, 
// progress monitorable, can be used securely, time agnostic 
// (work the same whether or not they have been already resolved),
// and will propagate unhandled errors.
//
// Promises can still be used with the normal Node promise API:
// var promise = process.Promise();
// promise.addCallback(function(){ ... });
// promise.emitSuccess("done");
//


var Promise = function(){
};

function enqueue(func){
  setTimeout(func);
}

/** Dojo/NodeJS methods*/
Promise.prototype.addCallback = function(callback){
  return this.then(callback);
};

Promise.prototype.addErrback = function(errback){
  return this.then(null, errback);
};

/*Dojo methods*/
Promise.prototype.addBoth = function(callback){
  return this.then(callback, callback);
};

Promise.prototype.addCallbacks = function(callback, errback){
  return this.then(callback, errback);
};

/*NodeJS method*/
Promise.prototype.wait = function(){
  return process.Promise.wait(this);
};

Deferred.prototype = Promise.prototype;
// process.Promise is a promise/deferred
process.Promise = defer;

// A deferred provides an API for creating and resolving a promise.
function defer(){
  return new Deferred();
} 

var contextHandler = defer.contextHandler = {};

function Deferred(canceller, rejectImmediately){
  var result, finished, isError, waiting = [], handled;
  var promise = this.promise = new Promise();
  var currentContextHandler = contextHandler.getHandler && contextHandler.getHandler();
  
  function notifyAll(value){
    if(finished){
      throw new Error("This deferred has already been resolved");        
    }
    result = value;
    finished = true;
    if(rejectImmediately && isError && waiting.length === 0){
      throw result[0];
    }
    for(var i = 0; i < waiting.length; i++){
      notify(waiting[i]);  
    }
  }
  function notify(listener){
    var func = (isError ? listener.error : listener.resolved);
    if(func){
      handled = true;
      enqueue(function(){
        if(currentContextHandler){
          currentContextHandler.resume();
        }
        try{
          var newResult = func.apply(null, result);
          if(newResult && typeof newResult.then === "function"){
            newResult.then(listener.deferred.resolve, listener.deferred.reject);
            return;
          }
          listener.deferred.resolve(newResult);
        }
        catch(e){
          listener.deferred.reject(e);
        }
        finally{
          if(currentContextHandler){
            currentContextHandler.suspend();
          }
        }
      });
    }
    else{
      listener.deferred[isError ? "reject" : "resolve"].apply(listener.deferred, result);
    }
  }
  // calling resolve will resolve the promise
  this.resolve = this.callback = this.emitSuccess = function(){
    notifyAll(arguments);
  };
  
  var reject = function(){
    isError = true;
    notifyAll(arguments);
  };
  
  // calling error will indicate that the promise failed
  this.reject = this.errback = this.emitError = rejectImmediately ? reject : function(error){
    return enqueue(function(){
      reject(error);
    });
  } 
  // call progress to provide updates on the progress on the completion of the promise
  this.progress = function(update){
    for(var i = 0; i < waiting.length; i++){
      var progress = waiting[i].progress;
      progress && progress(update);  
    }
  }
  // provide the implementation of the promise
  this.then = promise.then = function(resolvedCallback, errorCallback, progressCallback){
    var returnDeferred = new Deferred(promise.cancel, true);
    var listener = {resolved: resolvedCallback, error: errorCallback, progress: progressCallback, deferred: returnDeferred}; 
    if(finished){
      notify(listener);
    }
    else{
      waiting.push(listener);
    }
    return returnDeferred.promise;
  };
  
  if(canceller){
    this.cancel = promise.cancel = function(){
      var error = canceller();
      if(!(error instanceof Error)){
        error = new Error(error);
      }
      reject(error);
    }
  }
};
/** Adapted from Node's original wait implementation */
/* Poor Man's coroutines */
var coroutineStack = [];

function destack(promise) {
  promise._blocking = false;

  while (coroutineStack.length > 0 &&
    !coroutineStack[coroutineStack.length-1]._blocking)
  {
  coroutineStack.pop();
  process.unloop("one");
  }
};

/**
 * Waits for the given promise to finish, blocking (and executing other events)
 * if necessary to wait for the promise to finish. If target is not a promise
 * it will return the target immediately. If the promise results in an reject,
 * that reject will be thrown.
 * @param target   promise or value to wait for.
 * @return the value of the promise;
 */
process.Promise.wait = function(promise){
  var ret;
  var hadError = false;

  promise.then(function () {
    if (arguments.length == 1) {
      ret = arguments[0];
    } else if (arguments.length > 1) {
      ret = Array.prototype.slice.call(arguments);
    }
    destack(promise);
  },function (arg) {

    hadError = true;
    ret = arg;
    destack(promise);
  });

  coroutineStack.push(promise);
  if (coroutineStack.length > 10) {
    process.stdio.writeError("WARNING: promise.wait() is being called too often.\n");
  }
  promise._blocking = true;

  process.loop();

  process.assert(promise._blocking == false);

  if (hadError) {
    if (ret) {
      throw ret;
    } else {
      throw new Error("Promise completed with error (No arguments given.)");
    }
  }
  return ret;
};
