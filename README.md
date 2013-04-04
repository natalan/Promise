JavaScript Promise
=======

JavaScript Promise implementation based on John Hann's Promise [gist](https://gist.github.com/3281076/16dcb54a693e87965438e0de66e8d732c9334e1d). 

Usage
-----

```javascript
var doSomething = function(data){
  // instantiating a promise
  var promise = new Promise;
  
  // some function that accepts success and error handlers
  process({
    data: data,
    success: function(result){
      promise.resolve(result);
    },
    error: function(error){
      promise.reject(error)
    }
  });
  
  // returning 'limited' version of promise
  return promise.limited();
};

doSomething().then(function onResolve(result){
  // handle result
}, function onReject(error){
  // handle error
});
```

Nested Promises
-----
```javascript
var promiseA = new Promise,
    promiseB = new Promise,
    nestedPromise = new Promise(promiseA, promiseB).success(function(value) {
        alert(value.join(" "));
    });

promiseA.resolve("nestedPromise");
promiseB.resolve("resolved"); /* alerts "nestedPromise resolved" */

```

Filtered Promises chain
-----
```javascript
    var promise = new Promise();

    var asyncFunction_1 = function(arg) {
        var p = new Promise;

        setTimeout(function() {
            p.resolve(arg + 1);
        }, 1000);

        // return promise to continue the chain
        return p;
    };

    var asyncFunction_2 = function(arg) {
        var p = new Promise;

        setTimeout(function() {
            p.resolve(arg + 2);
        }, 1000);

        return p;
    };

    var syncFunction = function(arg) {
        alert(arg + 3);
    };

    // chain async and sync functions
    promise.then(asyncFunction_1).then(asyncFunction_2).then(syncFunction);

    promise.resolve(1); /* two seconds later alerts "7" */

```

Credits to [@solid_coder](https://twitter.com/solid_coder) and [@unscriptable](https://twitter.com/unscriptable)