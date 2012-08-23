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

Credits to [@solid_coder](https://twitter.com/unscriptable) and [@unscriptable](https://twitter.com/unscriptable)