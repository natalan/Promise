var promise, success, failure, limited;

var assertTrue = function(message, assert) {
        if (typeof assert !== "undefined") {
            return ok(assert, message);
        } else {
            return ok(message);
        }
    },
    assertFalse = function(message, assert) {
        if (typeof assert !== "undefined") {
            return equal(assert, false, message);
        } else {
            return equal(message, false);
        }
    },
    assertInstanceOf = function(message, constructor, assert) {
        if (typeof assert !== "undefined") {
            return ok(assert instanceof constructor, message);
        } else {
            return ok(constructor instanceof message);
        }
    },
    expectAsserts = function(num) {
        return expect(num);
    },
    assertEquals = function(message, actual, expected) {
        return equal(actual, expected, message);
    },
    assertException = function(block, expected) {
        return throws(block, expected);
    };

QUnit.module("Promise", {
    setup: function() {
        promise = new Promise;
        limited = promise.limited();
        success = sinon.spy();
        failure = sinon.spy();
    },
    teardown: function() {
        promise = success = failure = limited = null;
    }
});

test("test promise should be instance of Promise", function(){
    ok(promise instanceof Promise);
    ok(limited instanceof Promise)
});



test("test promise then method returns another promise", function(){
    var t = promise.then(success);
    ok(t instanceof Promise, "returned value is an instance of Promise");
    equal(t === promise, false, "returned value is not equal to promise");

});

test("test regular promise has access to resolve/reject methods", function(){
    ok("resolve" in promise, "Regular promise has access to resolve function");
    ok("reject" in promise, "Regular promise has access to reject function");
});

test("test success flow with regular promise", function(){
    promise.then(success, failure);
    promise.resolve();
    assertTrue("Success function called", success.called);
    assertFalse("Failure hasn't called", failure.called);
});

test("test success flow with regular promise and arguments", function(){
    promise.then(success, failure);
    promise.resolve("12345");
    assertTrue("Success function called with arguments", success.calledWithExactly("12345"));
});

test("test failure flow with regular promise", function(){
    promise.then(success, failure);
    promise.reject();
    assertFalse("Success function called", success.called);
    assertTrue("Failure hasn't called", failure.called);
});

test("test failure flow with regular promise and argument", function(){
    promise.then(success, failure);
    promise.reject("12345");
    assertTrue("Failure function called with arguments", failure.calledWithExactly("12345"));
});

test("test promise still pending should never call then handlers", function(){
    promise.then(success);
    assertFalse("Success function not called", success.called);
});

test("test providing only one success argument", function(){
    promise.then(success);
    promise.resolve();
    assertTrue("Success function called", success.called);
});

test("test limited promise cannot resolve/reject itself", function(){
    assertFalse("Limited promise doesn't have access to resolve function", "resolve" in limited);
    assertFalse("Limited promise doesn't have access to reject function", "reject" in limited);
});

test("test success flow with limited promise", function(){
    limited.then(success, failure);
    promise.resolve();
    assertTrue("Success function called", success.called);
    assertFalse("Failure hasn't called", failure.called);

});

test("test success flow with limited promise and argument", function(){
    limited.then(success, failure);
    promise.resolve("12345");
    assertTrue("Success function called with arguments", success.calledWithExactly("12345"));
});

test("test failure flow with limited promise", function(){
    limited.then(success, failure);
    promise.reject();
    assertFalse("Success function called", success.called);
    assertTrue("Failure hasn't called", failure.called);
});

test("test failure flow with limited promise and argument", function(){
    limited.then(success, failure);
    promise.reject("12345");
    assertTrue("Failure function called with arguments", failure.calledWithExactly("12345"));
});

test("test regular promise in terminal state should continue executing handlers :: success", function(){
    promise.resolve();
    promise.then(success, failure);
    assertTrue("Success handler called", success.called);
    assertFalse("Failure handler hasn't called", failure.called);
});

test("test regular promise in terminal state should continue executing handlers :: failure", function(){
    promise.reject();
    promise.then(success, failure);
    assertTrue("Failure handler called", failure.called);
    assertFalse("Success handler hasn't called", success.called);
});

test("test regular promise in terminal state should continue executing handlers with stored termination value :: success", function(){
    promise.resolve("12345");
    promise.then(success, failure);
    assertTrue("Success handler called with arguments", success.calledWithExactly("12345"));
    assertFalse("Failure handler hasn't called", failure.called);
});

test("test regular promise in terminal state should continue executing handlers with stored termination value :: failure", function(){
    promise.reject("12345");
    promise.then(success, failure);
    assertTrue("Failure handler called with arguments", failure.calledWithExactly("12345"));
    assertFalse("Success handler hasn't called", success.called);
});

test("test limited promise in terminal state should continue executing handlers :: success", function(){
    promise.resolve();
    limited.then(success, failure);
    assertTrue("Success handler called", success.called);
    assertFalse("Failure handler hasn't called", failure.called);
});

test("test limited promise in terminal state should continue executing handlers :: failure", function(){
    promise.reject();
    limited.then(success, failure);
    assertFalse("Success handler hasn't called", success.called);
    assertTrue("Failure handler has called", failure.called);
});

test("test limited promise in terminal state should continue executing handlers with stored termination value :: success", function(){
    promise.resolve("12345");
    limited.then(success, failure);
    assertTrue("Success handler called", success.calledWithExactly("12345"));
    assertFalse("Failure handler hasn't called", failure.called);
});

test("test limited promise in terminal state should continue executing handlers with stored termination value :: failure", function(){
    promise.reject("12345");
    limited.then(success, failure);
    assertFalse("Success handler hasn't called", success.called);
    assertTrue("Failure handler has called", failure.calledWithExactly("12345"));
});

test("test multiple promises are not related to each other", function(){
    var promise2 = new Promise();
    promise.then(success, failure);
    promise2.then(success, failure);

    assertTrue("Promise 1 still pending", promise.status() === 0);
    assertTrue("Promise 2 still pending", promise2.status() === 0);

    promise.resolve();
    assertTrue("Promise 1 is resolved", promise.status() === 1);
    assertTrue("Promise 2 still pending", promise2.status() === 0);
    assertTrue("Success handler called once", success.calledOnce);

    promise2.resolve();
    assertTrue("Promise 1 is resolved", promise.status() === 1);
    assertTrue("Promise 2 is resolved", promise2.status() === 1);
    assertTrue("Success handler called twice", success.calledTwice);
});

test("test trying to complete a completed promise should throw an error", function(){
    promise.resolve();

    assertException(function(){
        promise.resolve();
    }, "Error");

    assertException(function(){
        promise.reject();
    }, "Error");
});

test("test success method", function() {
    var p = promise.done(success);
    promise.resolve("12345");
    assertTrue(p instanceof Promise);
    assertTrue("Success handler called", success.calledWithExactly("12345"));
    assertFalse("Failure hasn't called", failure.called);
});

test("test success method for limited", function() {
    var p = limited.done(success);
    promise.resolve("12345");
    assertTrue(p instanceof Promise);
    assertTrue("Success handler called", success.calledWithExactly("12345"));
    assertFalse("Failure hasn't called", failure.called);
});

test("test error method", function() {
    var p = promise.fail(failure);
    promise.reject("12345");
    assertTrue(p instanceof Promise);
    assertTrue("Error handler called", failure.calledWithExactly("12345"));
    assertFalse("Success hasn't called", success.called);
});

test("test error method for limited", function() {
    var p = limited.fail(failure);
    promise.reject("12345");
    assertTrue("Error handler called", failure.calledWithExactly("12345"));
    assertTrue(p instanceof Promise);
    assertFalse("Success hasn't called", success.called);
});

test("test chaining for success", function() {
    promise.done(success).done(success);
    promise.resolve();
    assertTrue("Success handler called twice", success.calledTwice);
});

test("test resolved promise has a type of promise", function() {
    promise.done(success);
    var resolved = promise.resolve();
    assertInstanceOf("Resolved promise is not instance of promise", Promise, resolved);
});

test("test rejected promise has a type of promise", function() {
    promise.done(success);
    var rejected = promise.reject();
    assertInstanceOf("Rejected promise is not instance of promise", Promise, rejected);
});

test("test implementation with multiple promises, aka Master Promise", function() {
    var promiseA = new Promise,
        promiseB = new Promise;

    var masterPromise = new Promise(promiseA, promiseB).then(success, failure);
    // initial state and types
    assertInstanceOf("masterPromise is not type of Promise", Promise, masterPromise);

    assertTrue("Promise A still pending", promiseA.status() === 0);
    assertTrue("Promise B still pending", promiseB.status() === 0);
    assertTrue("masterPromise still pending", masterPromise.status() === 0);

    // now resolve one of the promises without args
    promiseA.resolve();
    assertTrue("Promise A is resolved", promiseA.status() === 1);
    assertTrue("Promise B still pending", promiseB.status() === 0);
    assertTrue("masterPromise still pending", masterPromise.status() === 0);

    // resolve another promise with some argument that we test later
    promiseB.resolve({
        "B": "testing"
    });
    assertTrue("Promise A is resolved", promiseA.status() === 1);
    assertTrue("Promise B is resolved", promiseB.status() === 1);
    assertTrue("masterPromise is resolved", masterPromise.status() === 1);
    var successArray = new Array(2);
    successArray[1] = {
        "B": "testing"
    };
    assertTrue(success.calledWithExactly(successArray));
    assertFalse(failure.called);

});

test("test Master Promise with an Array of promises as an argument", function() {
    var promiseA = new Promise,
        promiseB = new Promise;

    var masterPromise = new Promise([promiseA, promiseB]).then(success, failure);

    // initial state and types
    assertInstanceOf("masterPromise is not type of Promise", Promise, masterPromise);

    assertTrue("Promise A still pending", promiseA.status() === 0);
    assertTrue("Promise B still pending", promiseB.status() === 0);
    assertTrue("masterPromise still pending", masterPromise.status() === 0);

    // now resolve one of the promises without args
    promiseA.resolve();
    assertTrue("Promise A is resolved", promiseA.status() === 1);
    assertTrue("Promise B still pending", promiseB.status() === 0);
    assertTrue("masterPromise still pending", masterPromise.status() === 0);

    // resolve another promise with some argument that we test later
    promiseB.resolve({
        "B": "testing"
    });
    assertTrue("Promise A is resolved", promiseA.status() === 1);
    assertTrue("Promise B is resolved", promiseB.status() === 1);
    assertTrue("masterPromise is resolved", masterPromise.status() === 1);
    var successArray = new Array(2);
    successArray[1] = {
        "B": "testing"
    };
    assertTrue(success.calledWithExactly(successArray));
    assertFalse(failure.called);
});

test("test Master Promise should be rejected when one of its subordinates gets rejected", function() {
    var promiseA = new Promise,
        promiseB = new Promise;

    var masterPromise = new Promise(promiseA, promiseB).then(success, failure);

    // now reject one of the promises
    promiseA.reject("rejected promise");
    assertTrue("Promise A is rejected", promiseA.status() === -1);
    assertTrue("Promise B still pending", promiseB.status() === 0);
    assertTrue("masterPromise is rejected", masterPromise.status() === -1);
    assertTrue(failure.calledWithExactly("rejected promise"));
    assertFalse(success.called);

});

test("test Master Promise with other nested promises", function() {
    var promiseA = new Promise,
        promiseB = new Promise,
        promiseC = new Promise(promiseB);

    var masterPromise = new Promise(promiseA, promiseC).done(success);

    promiseB.resolve();
    assertTrue(promiseA.status() === 0);
    assertTrue(promiseB.status() === 1);
    assertTrue(masterPromise.status() === 0);

    promiseA.resolve();
    assertTrue(promiseA.status() === 1);
    assertTrue(promiseB.status() === 1);
    assertTrue(masterPromise.status() === 1);
});

test("test Master Promise with other nested promises - reject use case", function() {
    var promiseA = new Promise,
        promiseB = new Promise,
        promiseC = new Promise,
        promiseD = new Promise(promiseB, promiseC);

    var masterPromise = new Promise(promiseA, promiseD);

    promiseB.resolve();
    assertTrue(promiseA.status() === 0);
    assertTrue(promiseB.status() === 1);
    assertTrue(promiseC.status() === 0);
    assertTrue(promiseD.status() === 0);
    assertTrue(masterPromise.status() === 0);

    promiseA.resolve();
    assertTrue(promiseA.status() === 1);
    assertTrue(promiseB.status() === 1);
    assertTrue(promiseC.status() === 0);
    assertTrue(promiseD.status() === 0);
    assertTrue(masterPromise.status() === 0);

    promiseC.reject();
    assertTrue(promiseA.status() === 1);
    assertTrue(promiseB.status() === 1);
    assertTrue(promiseC.status() === -1);
    assertTrue(promiseD.status() === -1);
    assertTrue(masterPromise.status() === -1);
});

test("test master promise with argument other than promise", function() {
    var promiseA = new Promise,
        promiseB = new Promise,
        promiseC = new Promise(promiseB);

    var masterPromise = new Promise(promiseA, promiseC).done(success);

    promiseB.resolve();
    assertTrue(promiseA.status() === 0);
    assertTrue(promiseB.status() === 1);
    assertTrue(masterPromise.status() === 0);

    promiseA.resolve();
    assertTrue(promiseA.status() === 1);
    assertTrue(promiseB.status() === 1);
    assertTrue(masterPromise.status() === 1);
});

test("test multiple thens - done", function() {
    expectAsserts(3);

    var callback1 = sinon.spy(),
        callback2 = sinon.spy();

    promise.then(function(value) {
        callback1();
        assertEquals("Value is 5", value, 5);
        return value * 2;
    }).then(function(value) {
            callback2();
            assertEquals("Value is 10", value, 10);
        });

    promise.resolve(5);
    assertTrue("callback order execution", callback1.calledBefore(callback2));
});

test("test multiple thens - fail", function() {
    expectAsserts(3);

    var callback1 = sinon.spy(),
        callback2 = sinon.spy();

    promise.then(function(value) {}, function(value) {
        callback1();
        assertEquals("Value is 5", value, 5);
        return value * 2;
    }).then(function() {}, function(value) {
            callback2();
            assertEquals("Value is 10", value, 10);
        });

    promise.reject(5);
    assertTrue("callback order execution", callback1.calledBefore(callback2));
});

test("test back compatibility support for success", function() {
    promise.success(success);
    promise.resolve();
    assertTrue(success.called);
});

test("test multiple thens with async functions", function() {
    var clock = sinon.useFakeTimers(),
        spy1 = sinon.spy(),
        spy2 = sinon.spy(),
        spy3 = sinon.spy();

    var asyncFunction_1 = function(arg) {
        var p = new Promise;
        spy1(arg); //call the spy
        setTimeout(function() {
            p.resolve(arg + 1);
        }, 1000);

        return p;
    };

    var asyncFunction_2 = function(arg) {
        var p = new Promise;
        spy2(arg);
        setTimeout(function() {
            p.resolve(arg + 2);
        }, 1000);

        return p;
    };

    var syncFunction = function(arg) {
        spy3(arg);
        return (arg + 3);
    };

    var result = promise.then(asyncFunction_1).then(asyncFunction_2).then(syncFunction);

    assertInstanceOf("result is a Promise", Promise, result);
    promise.resolve(1);

    assertTrue("Spy1 was called with an arg", spy1.calledWithExactly(1));

    clock.tick(1001);
    assertTrue("Spy2 called", spy2.calledWithExactly(2));
    assertFalse("Spy3 wasn't called", spy3.called);

    clock.tick(1001);
    assertTrue("Spy3 called", spy3.calledWithExactly(4));

    assertEquals("result of a promise is 7", 7, result.value());

    clock.restore();
});

test("test multiple thens with failure scenario", function() {
    var clock = sinon.useFakeTimers();

    var asyncFunction_1 = function(arg) {
        var p = new Promise;

        setTimeout(function() {
            p.reject(arg + 1);
        }, 1000);

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
        return (arg + 3);
    };


    var result = promise.then(asyncFunction_1).then(syncFunction, asyncFunction_2).then(syncFunction);

    promise.resolve(1);

    clock.tick(1001);
    clock.tick(1001);

    assertEquals("result of a promise is 6", 7, result.value());

    clock.restore();
});


test("failure scenario with multiple promises - resolve", function() {
    var a = function() {
        return (new Promise).resolve(0);
    };

    var b = function(aValue) {
        return aValue + 1;
    };

    var c = a().then(b);

    equal(c.value(), 1, "Expected that second promise will change main value");
});

test("failure scenario with multiple promises - reject", function() {
    var a = function() {
        return (new Promise).reject(0);
    };

    var b = function(aValue) {
        return aValue + 1;
    };

    var c = a().always(b);

    equal(c.value(), 1, "Expected that second promise will change main value");
});

test("another scenario with multiple promises", function() {
    var clock = sinon.useFakeTimers();

    var a = function() {
        var a = new Promise;
        setTimeout(function() {
            a.resolve(0);
        }, 300);
        return a;
    };

    var b = function(aValue) {
        return aValue + 1;
    };

    var c = a().then(b);

    clock.tick(301);

    equal(c.value(), 1, "Expected that second promise will change the value");

    clock.restore();
});