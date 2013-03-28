(function() {

    var promise, success, failure, limited;

    TestCase("Promise", {

        setUp: function() {
            promise = new Promise;
            limited = promise.limited();
            success = sinon.spy();
            failure = sinon.spy();
        },

        tearDown: function() {
            promise = success = failure = limited = null;
        },

        "test promise should be instance of Promise": function(){
            assertTrue(promise instanceof Promise);
            assertTrue(limited instanceof Promise)
        },

        "test promise then method returns promise instance": function(){
            var t = promise.then(success);
            assertTrue("returned value is an instance of Promise", t instanceof Promise);
            assertTrue("returned value is equal to promise", t === promise);

        },

        "test regular promise has access to resolve/reject methods": function(){
            assertTrue("Regular promise has access to resolve function", "resolve" in promise);
            assertTrue("Regular promise has access to reject function", "reject" in promise);
        },

        "test success flow with regular promise": function(){
            promise.then(success, failure);
            promise.resolve();
            assertTrue("Success function called", success.called);
            assertFalse("Failure hasn't called", failure.called);
        },

        "test success flow with regular promise and arguments": function(){
            promise.then(success, failure);
            promise.resolve("12345");
            assertTrue("Success function called with arguments", success.calledWithExactly("12345"));
        },

        "test failure flow with regular promise": function(){
            promise.then(success, failure);
            promise.reject();
            assertFalse("Success function called", success.called);
            assertTrue("Failure hasn't called", failure.called);
        },

        "test failure flow with regular promise and argument": function(){
            promise.then(success, failure);
            promise.reject("12345");
            assertTrue("Failure function called with arguments", failure.calledWithExactly("12345"));
        },

        "test promise still pending should never call then handlers": function(){
            promise.then(success);
            assertFalse("Success function not called", success.called);
        },

        "test providing only one success argument": function(){
            promise.then(success);
            promise.resolve();
            assertTrue("Success function called", success.called);
        },

        "test limited promise cannot resolve/reject itself": function(){
            assertFalse("Limited promise doesn't have access to resolve function", "resolve" in limited);
            assertFalse("Limited promise doesn't have access to reject function", "reject" in limited);
        },

        "test success flow with limited promise": function(){
            limited.then(success, failure);
            promise.resolve();
            assertTrue("Success function called", success.called);
            assertFalse("Failure hasn't called", failure.called);

        },

        "test success flow with limited promise and argument": function(){
            limited.then(success, failure);
            promise.resolve("12345");
            assertTrue("Success function called with arguments", success.calledWithExactly("12345"));
        },

        "test failure flow with limited promise": function(){
            limited.then(success, failure);
            promise.reject();
            assertFalse("Success function called", success.called);
            assertTrue("Failure hasn't called", failure.called);
        },

        "test failure flow with limited promise and argument": function(){
            limited.then(success, failure);
            promise.reject("12345");
            assertTrue("Failure function called with arguments", failure.calledWithExactly("12345"));
        },

        "test regular promise in terminal state should continue executing handlers :: success": function(){
            promise.resolve();
            promise.then(success, failure);
            assertTrue("Success handler called", success.called);
            assertFalse("Failure handler hasn't called", failure.called);
        },

        "test regular promise in terminal state should continue executing handlers :: failure": function(){
            promise.reject();
            promise.then(success, failure);
            assertTrue("Failure handler called", failure.called);
            assertFalse("Success handler hasn't called", success.called);
        },

        "test regular promise in terminal state should continue executing handlers with stored termination value :: success": function(){
            promise.resolve("12345");
            promise.then(success, failure);
            assertTrue("Success handler called with arguments", success.calledWithExactly("12345"));
            assertFalse("Failure handler hasn't called", failure.called);
        },

        "test regular promise in terminal state should continue executing handlers with stored termination value :: failure": function(){
            promise.reject("12345");
            promise.then(success, failure);
            assertTrue("Failure handler called with arguments", failure.calledWithExactly("12345"));
            assertFalse("Success handler hasn't called", success.called);
        },

        "test limited promise in terminal state should continue executing handlers :: success": function(){
            promise.resolve();
            limited.then(success, failure);
            assertTrue("Success handler called", success.called);
            assertFalse("Failure handler hasn't called", failure.called);
        },

        "test limited promise in terminal state should continue executing handlers :: failure": function(){
            promise.reject();
            limited.then(success, failure);
            assertFalse("Success handler hasn't called", success.called);
            assertTrue("Failure handler has called", failure.called);
        },

        "test limited promise in terminal state should continue executing handlers with stored termination value :: success": function(){
            promise.resolve("12345");
            limited.then(success, failure);
            assertTrue("Success handler called", success.calledWithExactly("12345"));
            assertFalse("Failure handler hasn't called", failure.called);
        },

        "test limited promise in terminal state should continue executing handlers with stored termination value :: failure": function(){
            promise.reject("12345");
            limited.then(success, failure);
            assertFalse("Success handler hasn't called", success.called);
            assertTrue("Failure handler has called", failure.calledWithExactly("12345"));
        },

        "test multiple promises are not related to each other": function(){
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
        },

        "test always method handler will fire when promise rejected or resolved": function(){
            var p = promise.always(success).always(failure);

            p.resolve();

            p.always(success);

            assertTrue(p instanceof Promise);
            assertTrue("Success handler called", success.calledTwice);
            assertTrue("Failure hasn't called", failure.calledOnce);
        },

        "test trying to complete a completed promise should throw an error": function(){
            promise.resolve();

            assertException(function(){
                promise.resolve();
            }, "Error");

            assertException(function(){
                promise.reject();
            }, "Error");
        },

        "test success method": function() {
            var p = promise.success(success);
            promise.resolve("12345");
            assertTrue(p instanceof Promise);
            assertTrue("Success handler called", success.calledWithExactly("12345"));
            assertFalse("Failure hasn't called", failure.called);
        },

        "test success method for limited": function() {
            var p = limited.success(success);
            promise.resolve("12345");
            assertTrue(p instanceof Promise);
            assertTrue("Success handler called", success.calledWithExactly("12345"));
            assertFalse("Failure hasn't called", failure.called);
        },

        "test error method": function() {
            var p = promise.error(failure);
            promise.resolve("12345");
            assertTrue(p instanceof Promise);
            assertTrue("Error handler called", failure.calledWithExactly("12345"));
            assertFalse("Success hasn't called", success.called);
        },

        "test error method for limited": function() {
            var p = limited.error(failure);
            promise.resolve("12345");
            assertTrue("Error handler called", failure.calledWithExactly("12345"));
            assertTrue(p instanceof Promise);
            assertFalse("Success hasn't called", success.called);
        },

        "test chaining for success": function() {
            promise.success(success).success(success);
            promise.resolve();
            assertTrue("Success handler called twice", success.calledTwice);
        },

        "test resolved promise has a type of promise": function() {
            promise.success(success);
            var resolved = promise.resolve();
            assertInstanceOf("Resolved promise is not instance of promise", Promise, resolved);
        },

        "test rejected promise has a type of promise": function() {
            promise.success(success);
            var rejected = promise.reject();
            assertInstanceOf("Rejected promise is not instance of promise", Promise, rejected);
        },

        "test implementation with multiple promises, aka Master Promise": function() {
            var promiseA = new Promise,
                promiseB = new Promise;

            var masterPromise = new Promise(promiseA, promiseB).then(success, failure);
            // initial state and types
            assertInstanceOf("masterPromise is not type of Promise", Promise, masterPromise);
            assertFalse("masterPromise is Limited promise and doesn't have access to resolve function", "resolve" in masterPromise);
            assertFalse("masterPromise is Limited promise and doesn't have access to reject function", "reject" in masterPromise);

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

        },

        "test Master Promise should be rejected when one of its subordinates gets rejected": function() {
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

        },

        "test Master Promise with other nested promises": function() {
            var promiseA = new Promise,
                promiseB = new Promise,
                promiseC = new Promise(promiseB);

            var masterPromise = new Promise(promiseA, promiseC).success(success);

            promiseB.resolve();
            assertTrue(promiseA.status() === 0);
            assertTrue(promiseB.status() === 1);
            assertTrue(masterPromise.status() === 0);

            promiseA.resolve();
            assertTrue(promiseA.status() === 1);
            assertTrue(promiseB.status() === 1);
            assertTrue(masterPromise.status() === 1);
        },

        "test Master Promise with other nested promises - reject use case": function() {
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
        },

        "test master promise with argument other than promise": function() {
            var promiseA = new Promise,
                promiseB = new Promise,
                promiseC = new Promise(promiseB);

            var masterPromise = new Promise(promiseA, promiseC).success(success);

            promiseB.resolve();
            assertTrue(promiseA.status() === 0);
            assertTrue(promiseB.status() === 1);
            assertTrue(masterPromise.status() === 0);

            promiseA.resolve();
            assertTrue(promiseA.status() === 1);
            assertTrue(promiseB.status() === 1);
            assertTrue(masterPromise.status() === 1);
        }
    });
})();