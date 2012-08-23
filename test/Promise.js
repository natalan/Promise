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
            promise.always(success);
            promise.always(failure);

            promise.resolve();
            promise.always(success);

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
        }

    });
})();
