angular.module("managerApp").factory("debounce", function ($timeout, $q) {
    "use strict";
    return function (func, wait, immediate) {
        var timeout;
        var deferred = $q.defer();

        return function (...args) {
            var later = function () {
                timeout = null;
                if (!immediate) {
                    deferred.resolve(func.apply(this, args));
                    deferred = $q.defer();
                }
            };
            var callNow = immediate && !timeout;

            if (timeout) {
                $timeout.cancel(timeout);
            }
            timeout = $timeout(later, wait);

            if (callNow) {
                deferred.resolve(func.apply(this, args));
                deferred = $q.defer();
            }
            return deferred.promise;
        };
    };
});
