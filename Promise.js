/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, noarg:true, noempty:true, nonew:true, undef:true, strict:true, browser:true */
/* global console, exports, module, global, toString */

/*!
 *  JavaScript Promise
 *  @author Andrei Zharau & Sasha Malahov
 *  @license Released under the MIT license
 *
 *  https://github.com/natalan/Promise
 */
(function (global) {
    "use strict";
    // states
    var ERROR = -1,
        PENDING = 0,
        SUCCESS = 1,
        Create = Object.create,
        isArray = Array.isArray || function(obj) {
            return toString.call(obj) === '[object Array]';
        };

    var noop = function() {},
        resolve = function (val) { return this.complete('resolve', val);},
        reject = function (ex) { return this.complete('reject', ex);},
        functionValue = function (arg){
            return {
                writable: false,
                configurable: false,
                enumerable: true,
                value: arg
            };
        };

    global.Promise = function () {
        var thens = [],
            build = function (obj) {
                obj.status = function() { return status; };
                obj.value = function () { return itemValue; };
                return obj;
            },
            status = PENDING,
            itemValue,
            _reject = functionValue(reject),
            _resolve = functionValue(resolve),
        // limited is a promise object that provides a separation of consumer and producer to protect promises from being fulfilled by untrusted code.
            _limited = functionValue(function(){
                return build(Create(global.Promise.prototype, {
                    then: _then,
                    always: _always,
                    done: _done,
                    fail: _fail
                }));
            }),
            _complete = functionValue(function (which, arg) {
                var aThen, i = 0;
                if (this.status() !== 0) {
                    throw new Error('Promise already completed. Status: ' + this.status());
                }

                // change status of promise
                status  =  (which === 'resolve') ? SUCCESS : ERROR;
                // change value of promise
                itemValue = arg;

                while (aThen = thens[i++]) { aThen[which] && aThen[which](arg); }
                thens.splice(0,thens.length);

                return this;
            }),
            _always = functionValue(function(arg){
                return this.then(arg, arg);
            }),
            _then = functionValue(function (onResolve, onReject) {
                if (typeof onResolve !== 'function') {
                    throw new Error('Success argument is required!');
                }

                // onReject is optional here
                onReject = (onReject == null) ? noop : onReject;

                //create a new promise
                var newPromise = new global.Promise;

                // check if promise already completed
                if (this.isResolved()) {
                    newPromise.resolve( onResolve(this.value()) );
                } else if (this.isRejected()) {
                    newPromise.reject( onReject(this.value()) );
                } else if (this.isPending()) {
                    thens.push({
                        'resolve': function(val) {
                            var returned = onResolve(val);
                            if (returned instanceof global.Promise) {
                                returned.then(function(val) {
                                    newPromise.resolve(val);
                                }, function(val) {
                                    newPromise.reject(val);
                                });
                            } else {
                                newPromise.resolve(returned);
                            }
                        },
                        'reject': function(val) {
                            var returned = onReject(val);
                            if (returned instanceof global.Promise) {
                                returned.then(function(val) {
                                    newPromise.resolve(val);
                                }, function(val) {
                                    newPromise.reject(val);
                                });
                            } else {
                                newPromise.reject(returned);
                            }
                        }
                    });
                }

                return newPromise;
            }),
            _done = functionValue(function(arg){
                this.then(arg, noop);
                return this;
            }),
            _fail = functionValue(function(arg){
                this.then(noop, arg);
                return this;
            }),
            builder = function (){
                var obj = Create(global.Promise.prototype, {
                    reject: _reject,
                    resolve: _resolve,
                    then: _then,
                    always: _always,
                    complete: _complete,
                    limited: _limited,
                    done: _done,
                    fail: _fail
                });

                return build(obj);
            },
            masterPromise = builder(),
            args = arguments;

        // nested Promise implementation
        if (args.length) {
            var subordinates =[].slice.call(isArray(args[0]) ? args[0] : args),
                remaining = subordinates.length,
                values = new Array(subordinates.length),
                updateFunc = function(index) {
                    return function(value) {
                        values[index] = value;
                        if (!( --remaining )) {
                            masterPromise.resolve(values);
                        }
                    };
                };

            var _rejectMasterPromise = function rejectMasterPromise(value) {
                // automatically reject masterPromise if any of subordinates failed
                (masterPromise.status() === PENDING) && masterPromise.reject(value);
            };

            for (var i=0; i < subordinates.length; i++) {
                if (typeof subordinates[i] === 'function') {
                    // execute the function and assign the value to subordinate item
                    subordinates[i] = subordinates[i]();
                }

                if (subordinates[i] instanceof global.Promise) {
                    subordinates[i].then(updateFunc(i), _rejectMasterPromise);
                } else {
                    updateFunc(i)(subordinates[i]);
                }
            }
        }
        // preventing memory leaks by nullifying args, so it can go to gc
        args = null;

        return masterPromise;
    };

    global.Promise.prototype = {
        isResolved: function(){
            return this.status() === SUCCESS;
        },

        isRejected: function(){
            return this.status() === ERROR;
        },

        isPending: function(){
            return this.status() === PENDING;
        },

        /* these methods will be deprecated */
        success: function() {
            console.warn('Success method will be deprecated. Use .done() instead.');
            return this.done.apply(this, arguments);
        },
        error: function() {
            console.warn('Error method will be deprecated. Use .done() instead.');
            return this.fail.apply(this, arguments);
        }
    };

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = global.Promise;
        }
        exports.Promise = global.Promise;
    }


})(this);