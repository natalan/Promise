/*!
 *  JavaScript Promise
 *  Released under the MIT license
 *  https://github.com/natalan/Promise
 */

(function () {
    // states
    var ERROR = -1,
        PENDING = 0,
        SUCCESS = 1;

    function resolve (val) { this.complete('resolve', val); };
    function reject (ex) { this.complete('reject', ex); };
    function functionValue (arg){
        return {
            writable: false,
            configurable: false,
            enumerable: true,
            value: arg
        }
    }

    Promise = function () {
        var thens = [],
            build = function (obj) {
                obj.status = function() { return status };
                obj.value = function () { return itemValue };
                return obj;
            },
            status = PENDING,
            itemValue = undefined,
            _reject = functionValue(reject),
            _resolve = functionValue(resolve),
            _limited = functionValue(function(){
                return build(Object.create(Promise.prototype, {
                    then: _then,
                    always: _always
                }));
            }),
            _complete = functionValue(function (which, arg) {
                var aThen, i = 0;
                if (this.status() !== 0) {
                    throw new Error("Promise already completed. Status: " + this.status());
                    return;
                }
                while (aThen = thens[i++]) { aThen[which] && aThen[which](arg); }
                thens.splice(0,thens.length);
                // change status of promise
                status  =  (which === "resolve") ? SUCCESS : ERROR;
                // change value of promise
                itemValue = arg;
            }),
            _always = functionValue(function(arg){
                this.then(arg, arg);
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
            builder = function (){
                var obj = Object.create(Promise.prototype, {
                    reject: _reject,
                    resolve: _resolve,
                    then: _then,
                    always: _always,
                    complete: _complete,
                    limited: _limited
                });

                return build(obj);
            };
        return builder();
    };

    Promise.prototype = {
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
})();