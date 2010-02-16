Convenience functions for promises, much of this is taken from Tyler Close's ref_send and Kris Kowal's work on promises. 
Dual licensed under BSD and AFL.

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
       return items[items.length];
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



