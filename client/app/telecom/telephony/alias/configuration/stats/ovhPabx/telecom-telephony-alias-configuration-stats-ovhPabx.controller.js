angular.module("managerApp").controller("TelecomTelephonyAliasConfigurationStatsOvhPabxCtrl", function ($scope, $stateParams, $q, $timeout, OvhApiTelephony, ToastError) {
    "use strict";

    var self = this;
    var poller = null;
    var stopPolling = false;

    function init () {
        self.apiEndpoint = OvhApiTelephony.OvhPabx();
        self.queues = null;
        self.stats = {
            callsAnswered: 0,
            callsLost: 0,
            callsTotal: 0,
            totalCallDuration: 0,
            totalWaitingDuration: 0
        };

        $scope.$on("$destroy", function () {
            if (poller) {
                $timeout.cancel(poller);
            }
            stopPolling = true;
        });

        self.fetchQueues().then(function (queues) {
            self.queues = queues;
        }).catch(function (err) {
            return new ToastError(err);
        });

        self.pollGlobalStats();
    }

    self.fetchQueues = function () {
        return OvhApiTelephony.OvhPabx().Hunting().Queue().v6().query({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.then(function (ids) {
            return $q.all(_.map(ids, function (id) {
                return OvhApiTelephony.OvhPabx().Hunting().Queue().v6().get({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName,
                    queueId: id
                }).$promise.then(function (queue) {
                    if (queue.actionOnOverflowParam) {
                        queue.actionOnOverflowParam = parseInt(queue.actionOnOverflowParam, 10);
                    }
                    return queue;
                });
            }));
        });
    };

    self.fetchGlobalStats = function () {
        var result = {
            callsAnswered: 0,
            callsLost: 0,
            callsTotal: 0,
            totalCallDuration: 0,
            totalWaitingDuration: 0
        };
        return OvhApiTelephony.OvhPabx().Hunting().Queue().v6().query({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.then(function (ids) {
            return $q.all(_.map(ids, function (id) {
                return OvhApiTelephony.OvhPabx().Hunting().Queue().v6().getLiveStatistics({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName,
                    queueId: id
                }).$promise.then(function (stats) {
                    result.callsAnswered += stats.callsAnswered;
                    result.callsLost += stats.callsLost;
                    result.callsTotal += stats.callsTotal;
                    result.totalCallDuration += stats.totalCallDuration;
                    result.totalWaitingDuration += stats.totalWaitingDuration;
                });
            }));
        }).then(function () {
            return result;
        });
    };

    self.pollGlobalStats = function () {
        var periodicRefresh = function () {
            self.fetchGlobalStats().then(function (stats) {
                self.stats = stats;
            }).finally(function () {
                if (!stopPolling) {
                    poller = $timeout(periodicRefresh, 2000);
                }
            });
        };
        $timeout(periodicRefresh, 2000);
    };

    self.getAverageWaitTime = function () {
        return self.stats.totalWaitingDuration / self.stats.callsTotal;
    };

    self.getAverageCallTime = function () {
        return self.stats.totalCallDuration / self.stats.callsAnswered;
    };

    self.getQoS = function () {
        // percentage rounded with two decimals
        return Math.round(self.stats.callsAnswered / self.stats.callsTotal * 100 * 100) / 100;
    };

    init();
});
