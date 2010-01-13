/**
* Convenience functions for promises, primarily based on the ref_send API
*/
function perform(value, async, sync){
    try{
        if(value && typeof value.then === "function"){
            value = async(value);
        }
        else{
            value = sync(value);
        }
        if(value && typeof value.then === "function"){
            return value;
        }
        var deferred = new process.Promise();
        deferred.resolve(value);
        return deferred.promise;
    }catch(e){
        var deferred = new process.Promise();
        deferred.reject(e);
        return deferred.promise;
    }
    
}
/**
 * Promise manager to make it easier to consume promises
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
    return perform(value, function(value){
        return value.then(resolvedCallback, rejectCallback, progressCallback);
    },
    function(value){
        return resolvedCallback(value);
    });
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
    if(value && typeof value.then === "function"){
    	return exports.whenPromise(value, resolvedCallback, rejectCallback, progressCallback);
    }
    return resolvedCallback(value);
};

/**
 * Gets the value of a property in a future turn.
 * @param target    promise or value for target object
 * @param property      name of property to get
 * @return promise for the property value
 */
exports.get = function(target, property){
    return perform(target, function(target){
        return target.get(property);
    },
    function(target){
        return target[property]
    });
};

/**
 * Invokes a method in a future turn.
 * @param target    promise or value for target object
 * @param methodName      name of method to invoke
 * @param args      array of invocation arguments
 * @return promise for the return value
 */
exports.post = function(target, methodName, args){
    return perform(target, function(target){
        return target.call(property, args);
    },
    function(target){
        return target[methodName].apply(target, args);
    });
};

/**
 * Sets the value of a property in a future turn.
 * @param target    promise or value for target object
 * @param property      name of property to set
 * @param value     new value of property
 * @return promise for the return value
 */
exports.put = function(target, property, value){
    return perform(target, function(target){
        return target.put(property, value);
    },
    function(target){
        return target[property] = value;
    });
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
 * @param group  The array of promises
 * @return the promise that is fulfilled when all the array is fulfilled
 */
exports.group = function(group){
	var deferred = defer();
	if(!(group instanceof Array)){
		group = Array.prototype.slice.call(arguments);
	}
	var fulfilled, length = group.length;
	var results = [];
	group.forEach(function(promise, index){
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
