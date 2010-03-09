Convenience functions for promises, much of this is adapted from Tyler Close's ref_send and Kris Kowal's work on promises. 

MIT License.

A typical usage:
A default Promise constructor can be used to create a self-resolving deferred/promise:

    var Promise = require("promise").Promise;
    var promise = new Promise();
    asyncOperation(function(){
      Promise.resolve("succesful result");
    });
    promise -> given to the consumer
 
A consumer can use the promise

   promise.then(function(result){
       ... when the action is complete this is executed ...
   },
   function(error){
        ... executed when the promise fails
   });

Alternately, a provider can create a deferred and resolve it when it completes an action. 
The deferred object a promise object that provides a separation of consumer and producer to protect
promises from being fulfilled by untrusted code.

    var defer = require("promise").defer;
    var deferred = defer();
    asyncOperation(function(){
      deferred.resolve("succesful result");
    });
    deferred.promise -> given to the consumer
 
Another way that a consumer can use promises:

    var when = require("promise").when;
    when(promise,function(result){
       ... when the action is complete this is executed ...
    },
    function(error){
       ... executed when the promise fails
    });

More examples:

    function printFirstAndList(itemsDeferred){
      findFirst(itemsDeferred).then(sys.puts);
      findLast(itemsDeferred).then(sys.puts);
    }
    function findFirst(itemsDeferred){
      return itemsDeferred.then(function(items){
        return items[0];
      });
    }
    function findLast(itemsDeferred){
      return itemsDeferred.then(function(items){
        return items[items.length];
      });
    }

And now you can do:

    printFirstAndLast(someAsyncFunction());


The workhorse function of this library is the "when" function, which provides a means for normalizing interaction with values and functions that may be a normal synchronous value, or may be a promise (asynchronously fulfilled). The when() function takes a value that may be a promise or a normal value for the first function, and when the value is ready executes the function provided as the second argument (immediately in the case of a non-promise normal value). The value returned from when() is the result of the execution of the provided function, and returns a promise if provided a promise or synchronously returns a normal value if provided a non-promise value. This makes it easy to "chain" computations together. This allows us to write code that is agnostic to sync/async interfaces:

    var when = require("promise").when;
    function printFirstAndLast(items){
      // print the first and last item
      when(findFirst(items), sys.puts);
      when(findLast(items), sys.puts);
    }
    function findFirst(items){
       // return the first item
       return when(items, function(items){
         return items[0];
       });
    }
    function findLast(items){
       // return the last item
       return when(items, function(items){
         return items[items.length - 1];
       });
    }

Now we can do:

    > printFirstAndLast([1,2,3,4,5]);
    1
    5

And we can also provide asynchronous promise:

    var promise = new process.Promise();
    > printFirstAndLast(promise);

(nothing printed yet)

    > promise.emitSuccess([2,4,6,8,10]);
    2
    10


The "all" function is intended to provide a means for waiting for the completion of an array of promises. The "all" function should be passed an array of promises, and it returns an promise that is fulfilled once all the promises in the array are fulfilled. The returned promise's resolved value will be an array with the resolved values of all of the promises in the passed in array.

The "first" function is intended to provide a means for waiting for the completion of the first promise in an array of promises to be fulfilled. The "first" function should be passed an array of promises, and it returns an promise that is fulfilled once the first promise in the array is fulfilled. The returned promise's resolved value will be the resolved value of the first fulfilled promise.

