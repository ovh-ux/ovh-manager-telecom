angular.module("managerApp").controller("TelecomTelephonyAliasConfigurationStatsEasyHuntingCtrl", function ($scope, $stateParams, $q, $timeout, $uibModal, moment, Telephony, ToastError) {
    "use strict";

    var self = this;
    var poller = null;
    var stopPolling = false;

    function init () {
        self.isLoading = true;
        $scope.$on("$destroy", function () {
            if (poller) {
                $timeout.cancel(poller);
            }
            stopPolling = true;
        });
        self.fetchFirstQueueId().then(function (queueId) {
            self.queueId = queueId;
            self.pollStats(queueId);
            return self.refreshStats(queueId);
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isLoading = false;
        });
    }

    self.fetchFirstQueueId = function () {
        return Telephony.EasyHunting().Hunting().Queue().Lexi().query({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.then(function (ids) {
            return _.first(ids);
        });
    };

    self.refreshStats = function (queueId) {
        return $q.all({
            stats: self.fetchQueueLiveStatistics(queueId),
            calls: self.fetchQueueLiveCalls(queueId),
            agentsStatus: self.fetchAgentsLiveStatus(queueId)
        }).then(function (result) {
            self.stats = result.stats;
            self.calls = result.calls;
            self.agentsStatus = result.agentsStatus;
        });
    };

    self.pollStats = function (queueId) {
        var periodicRefresh = function () {
            self.refreshStats(queueId).finally(function () {
                if (!stopPolling) {
                    poller = $timeout(periodicRefresh, 1000);
                }
            });
        };
        $timeout(periodicRefresh, 1000);
    };

    self.fetchQueueLiveStatistics = function (queueId) {
        return Telephony.EasyHunting().Hunting().Queue().Lexi().getLiveStatistics({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName,
            queueId: queueId
        }).$promise;
    };

    self.fetchQueueLiveCalls = function (queueId) {
        return Telephony.EasyHunting().Hunting().Queue().LiveCalls().Lexi().query({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName,
            queueId: queueId
        }).$promise.then(function (callsIds) {
            return $q.all(_.map((callsIds || []).reverse(), function (callId) {
                return Telephony.EasyHunting().Hunting().Queue().LiveCalls().Lexi().get({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName,
                    queueId: queueId,
                    id: callId
                }).$promise;
            }));
        });
    };

    self.fetchAgentsLiveStatus = function (queueId) {
        Telephony.EasyHunting().Hunting().Queue().Agent().Lexi().resetAllCache();
        return Telephony.EasyHunting().Hunting().Queue().Agent().Lexi().query({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName,
            queueId: queueId
        }).$promise.then(function (agentIds) {
            return $q.all(_.map(agentIds, function (agentId) {
                return Telephony.EasyHunting().Hunting().Queue().Agent().Lexi().getLiveStatus({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName,
                    queueId: queueId,
                    agentId: agentId
                }).$promise.then(function (agentStatus) {
                    agentStatus.agentId = agentId;
                    return agentStatus;
                });
            }));
        });
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

    self.getOngoingCalls = function () {
        return _.filter(self.calls, function (call) {
            return call && call.state === "Answered" && call.answered && !call.end;
        });
    };

    self.getPendingCalls = function () {
        return _.filter(self.calls, function (call) {
            return call && call.state === "Waiting" && !call.answered && !call.end;
        });
    };

    self.getMaxWaitTime = function () {
        var max = 0;
        var value = 0;
        _.each(self.getPendingCalls(), function (call) {
            var elapsed = moment(call.begin).unix();
            if (elapsed > max) {
                max = elapsed;
                value = call.begin;
            }
        });
        return value;
    };

    self.getOnCallAgentsCount = function () {
        return _.filter(self.agentsStatus, function (agent) {
            return agent.status === "inAQueueCall" || agent.status === "receiving";
        }).length;
    };

    self.getWaitingAgentsCount = function () {
        return _.filter(self.agentsStatus, function (agent) {
            return agent.status === "waiting";
        }).length;
    };

    self.interceptCall = function (call) {
        $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/telephony/alias/configuration/stats/easyHunting/intercept/telecom-telephony-alias-configuration-stats-easyHunting-intercept.html",
            controller: "TelecomTelephonyAliasConfigurationStatsEasyHuntingInterceptCtrl",
            controllerAs: "$ctrl",
            resolve: {
                params: function () {
                    return {
                        billingAccount: $stateParams.billingAccount,
                        serviceName: $stateParams.serviceName,
                        callId: call.id,
                        queueId: self.queueId
                    };
                }
            }
        });
    };

    self.hangupCall = function (call) {
        $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/telephony/alias/configuration/stats/easyHunting/hangup/telecom-telephony-alias-configuration-stats-easyHunting-hangup.html",
            controller: "TelecomTelephonyAliasConfigurationStatsEasyHuntingHangupCtrl",
            controllerAs: "$ctrl",
            resolve: {
                params: function () {
                    return {
                        billingAccount: $stateParams.billingAccount,
                        serviceName: $stateParams.serviceName,
                        callId: call.id,
                        queueId: self.queueId
                    };
                }
            }
        });
    };

    self.transfertCall = function (call) {
        $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/telephony/alias/configuration/stats/easyHunting/transfert/telecom-telephony-alias-configuration-stats-easyHunting-transfert.html",
            controller: "TelecomTelephonyAliasConfigurationStatsEasyHuntingTransfertCtrl",
            controllerAs: "$ctrl",
            resolve: {
                params: function () {
                    return {
                        billingAccount: $stateParams.billingAccount,
                        serviceName: $stateParams.serviceName,
                        callId: call.id,
                        queueId: self.queueId
                    };
                }
            }
        });
    };

    self.eavesdropCall = function (call) {
        $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/telephony/alias/configuration/stats/easyHunting/eavesdrop/telecom-telephony-alias-configuration-stats-easyHunting-eavesdrop.html",
            controller: "TelecomTelephonyAliasConfigurationStatsEasyHuntingEavesdropCtrl",
            controllerAs: "$ctrl",
            resolve: {
                params: function () {
                    return {
                        billingAccount: $stateParams.billingAccount,
                        serviceName: $stateParams.serviceName,
                        callId: call.id,
                        queueId: self.queueId
                    };
                }
            }
        });
    };

    init();
});
