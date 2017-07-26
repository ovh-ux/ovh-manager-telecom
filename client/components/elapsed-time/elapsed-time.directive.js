/**
 * elapsedTime directive is a simple directive to display elapsed time in a human readable fashion.
 *
 * To update the display dynamically, a periodic timeout is called at a short time interval so the
 * displayed time in seconds is updated in real-time.
 *
 * To avoid creating a periodic timeout for EVERY directive, a service is used to SHARE the
 * periodic refreshing process between every elapsedTime directives. There are two benefits :
 *
 *   - angular loop is not called too many times because the refresh is called once for
 *     every elapsedTime directive
 *
 *   - elapsedTime directives are synced and updated at the same time : every directive is updated
 *     in a single angular loop
 */
angular.module("managerApp").service("ElapsedTimePeriodicUpdater", function ($timeout, $http, $q) {
    "use strict";

    var toRefresh = [];
    var deltaTime = null;
    var pendingDeltaTime = null;

    function refreshPeriodically (delta) {
        _.each(toRefresh, function (callback) {
            callback(delta);
        });
        if (toRefresh.length) {
            $timeout(function () {
                refreshPeriodically(delta);
            }, 250);
        }
    }

    return {
        register: function (callback) {
            if (!_.find(toRefresh, callback)) {
                toRefresh.push(callback);
            }
            if (toRefresh.length === 1) {
                this.getDeltaTime().then(function (delta) {
                    refreshPeriodically(delta);
                });
            }
        },
        unregister: function (callback) {
            _.pull(toRefresh, callback);
        },
        getDeltaTime: function () {
            if (deltaTime !== null) {
                return $q.when(deltaTime);
            } else if (pendingDeltaTime) {
                return pendingDeltaTime;
            }
            pendingDeltaTime = $http.get("/auth/time").then(function (result) {
                deltaTime = moment.unix(result.data).diff(moment(), "seconds");
                return deltaTime;
            }).finally(function () {
                pendingDeltaTime = null;
            });
            return pendingDeltaTime;
        }
    };
}).directive("elapsedTime", function (moment, $translatePartialLoader, $translate, $timeout, ElapsedTimePeriodicUpdater) {
    "use strict";

    return {
        restrict: "E",
        scope: {
            from: "=from"
        },
        template: "<span data-ng-bind='value'></span>",
        link: function (scope) {

            var isLoading = true;
            scope.value = "";

            function refresh (delta) {
                if (!isLoading) {
                    var from = moment(scope.from).subtract(delta, "seconds");
                    var days = moment().diff(from, "days");
                    var hours = moment().diff(from, "hours") - (24 * days);
                    var minutes = moment().diff(from, "minutes") - (days * 24 * 60) - (hours * 60);
                    var seconds = moment().diff(from, "seconds") - (days * 24 * 3600) - (hours * 3600) - (minutes * 60);

                    if (days > 0) {
                        scope.value = $translate.instant("elapsed_time_days", {
                            days: days,
                            hours: hours
                        });
                    } else if (hours > 0) {
                        scope.value = $translate.instant("elapsed_time_hours", {
                            hours: hours,
                            minutes: minutes,
                            seconds: seconds
                        });
                    } else if (minutes > 0) {
                        scope.value = $translate.instant("elapsed_time_minutes", {
                            minutes: minutes,
                            seconds: seconds
                        });
                    } else {
                        scope.value = $translate.instant("elapsed_time_seconds", {
                            seconds: seconds
                        });
                    }
                }
            }

            // load translations
            $translatePartialLoader.addPart("../components/elapsed-time");
            $translate.refresh().then(function () {
                isLoading = false;
                ElapsedTimePeriodicUpdater.getDeltaTime().then(function (delta) {
                    refresh(delta);
                });
            });

            // refresh when model changes
            scope.$watch("from", function () {
                ElapsedTimePeriodicUpdater.getDeltaTime().then(function (delta) {
                    refresh(delta);
                });
            });

            ElapsedTimePeriodicUpdater.register(refresh);
            scope.$on("$destroy", function () {
                ElapsedTimePeriodicUpdater.unregister(refresh);
            });
        }
    };
});
