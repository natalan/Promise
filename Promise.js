/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, noarg:true, noempty:true, nonew:true, undef:true, strict:true, browser:true */

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
        Create = Object.create;

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
                    success: _success,
                    error: _error
                }));
            }),
            _complete = functionValue(function (which, arg) {
                var aThen, i = 0;
                if (this.status() !== 0) {
                    throw new Error("Promise already completed. Status: " + this.status());
                }

                // change status of promise
                status  =  (which === "resolve") ? SUCCESS : ERROR;
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
                if (this.isResolved()) {
                    onResolve(this.value());
                }
                else if (this.isRejected()) {
                    onReject(this.value());
                }
                else if (this.isPending()) {
                    thens.push({ resolve: onResolve, reject: onReject });
                }
                // returning back a promise for chaining purposes
                return this;
            }),
            _success = functionValue(function(arg){
                return this.then(arg, noop);
            }),
            _error = functionValue(function(arg){
                return this.then(arg, noop);
            }),
            builder = function (){
                var obj = Create(global.Promise.prototype, {
                    reject: _reject,
                    resolve: _resolve,
                    then: _then,
                    always: _always,
                    complete: _complete,
                    limited: _limited,
                    success: _success,
                    error: _error
                });

                return build(obj);
            },
            masterPromise = builder(),
            args = arguments;

        // nested Promise implementation
        if (args.length) {
            var subordinates = [].slice.call(args),
                remaining = 0,
                values = new Array(subordinates.length),
                updateFunc = function(index) {
                    return function(value) {
                        values[index] = value;
                        if (!( --remaining )) {
                            masterPromise.resolve(values);
                        }
                    };
                };

            for (var i=0; i < subordinates.length; i++) {
                if (subordinates[i] instanceof global.Promise) {
                    remaining = remaining + 1;
                    subordinates[i].then(updateFunc(i), function rejectMasterPromise(value) {
                        // automatically reject masterPromise if any of subordinates failed
                        masterPromise.reject(value);
                    });
                }
            }

            // return limited promise because master promise can be fulfilled only by its subordinates
            return masterPromise.limited();
        } else {
            return masterPromise;
        }
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
        }
    };
})(this);