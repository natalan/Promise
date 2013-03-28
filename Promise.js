/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, noarg:true, noempty:true, nonew:true, undef:true, strict:true, browser:true */
/*!
 *  JavaScript Promise
 *  Released under the MIT license
 *  https://github.com/natalan/Promise
 */

(function (global) {
    "use strict";
    // states
    var ERROR = -1,
        PENDING = 0,
        SUCCESS = 1;

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
            _limited = functionValue(function(){
                return build(Object.create(global.Promise.prototype, {
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
                var obj = Object.create(global.Promise.prototype, {
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
            };
        return builder();
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