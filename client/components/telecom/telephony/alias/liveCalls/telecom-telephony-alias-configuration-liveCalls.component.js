angular.module("managerApp").component("telecomTelephonyAliasLiveCalls", {
    bindings: {
        apiEndpoint: "<",
        queueId: "<"
    },
    templateUrl: "components/telecom/telephony/alias/liveCalls/telecom-telephony-alias-configuration-liveCalls.html",
    controller: function ($scope, $stateParams, $q, $timeout, $uibModal, $translate, $translatePartialLoader, moment, ToastError) {
        "use strict";

        var self = this;

        var poller = null;
        var stopPolling = false;

        self.$onInit = function () {

            self.isLoading = true;

            $scope.$on("$destroy", function () {
                if (poller) {
                    $timeout.cancel(poller);
                }
                stopPolling = true;
            });

            $translatePartialLoader.addPart("../components/telecom/telephony/alias/liveCalls");
            $q.all([
                $translate.refresh(),
                self.getQueueId().then(function (queueId) {
                    self.queueId = queueId;
                    self.pollStats(queueId);
                    return self.refreshStats(queueId);
                })
            ]).catch(function (err) {
                return new ToastError(err);
            }).finally(function () {
                self.isLoading = false;
            });
        };

        self.getQueueId = function () {
            if (self.queueId) {
                return $q.when(self.queueId);
            }
            return self.apiEndpoint.Hunting().Queue().v6().query({
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
            return self.apiEndpoint.Hunting().Queue().v6().getLiveStatistics({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName,
                queueId: queueId
            }).$promise;
        };

        self.fetchQueueLiveCalls = function (queueId) {
            return self.apiEndpoint.Hunting().Queue().LiveCalls().v6().query({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName,
                queueId: queueId
            }).$promise.then(function (callsIds) {
                return $q.all(_.map((callsIds || []).reverse(), function (callId) {
                    return self.apiEndpoint.Hunting().Queue().LiveCalls().v6().get({
                        billingAccount: $stateParams.billingAccount,
                        serviceName: $stateParams.serviceName,
                        queueId: queueId,
                        id: callId
                    }).$promise;
                }));
            });
        };

        self.fetchAgentsLiveStatus = function (queueId) {
            self.apiEndpoint.Hunting().Queue().Agent().v6().resetAllCache();
            return self.apiEndpoint.Hunting().Queue().Agent().v6().query({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName,
                queueId: queueId
            }).$promise.then(function (agentIds) {
                return $q.all(_.map(agentIds, function (agentId) {
                    return self.apiEndpoint.Hunting().Queue().Agent().v6().getLiveStatus({
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
                templateUrl: "components/telecom/telephony/alias/liveCalls/intercept/telecom-telephony-alias-configuration-liveCalls-intercept.html",
                controller: "TelecomTelephonyAliasConfigurationLiveCallsInterceptCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    params: function () {
                        return {
                            billingAccount: $stateParams.billingAccount,
                            serviceName: $stateParams.serviceName,
                            callId: call.id,
                            queueId: self.queueId,
                            apiEndpoint: self.apiEndpoint
                        };
                    }
                }
            });
        };

        self.hangupCall = function (call) {
            $uibModal.open({
                animation: true,
                templateUrl: "components/telecom/telephony/alias/liveCalls/hangup/telecom-telephony-alias-configuration-liveCalls-hangup.html",
                controller: "TelecomTelephonyAliasConfigurationLiveCallsHangupCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    params: function () {
                        return {
                            billingAccount: $stateParams.billingAccount,
                            serviceName: $stateParams.serviceName,
                            callId: call.id,
                            queueId: self.queueId,
                            apiEndpoint: self.apiEndpoint
                        };
                    }
                }
            });
        };

        self.transfertCall = function (call) {
            $uibModal.open({
                animation: true,
                templateUrl: "components/telecom/telephony/alias/liveCalls/transfert/telecom-telephony-alias-configuration-liveCalls-transfert.html",
                controller: "TelecomTelephonyAliasConfigurationLiveCallsTransfertCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    params: function () {
                        return {
                            billingAccount: $stateParams.billingAccount,
                            serviceName: $stateParams.serviceName,
                            callId: call.id,
                            queueId: self.queueId,
                            apiEndpoint: self.apiEndpoint
                        };
                    }
                }
            });
        };

        self.eavesdropCall = function (call) {
            $uibModal.open({
                animation: true,
                templateUrl: "components/telecom/telephony/alias/liveCalls/eavesdrop/telecom-telephony-alias-configuration-liveCalls-eavesdrop.html",
                controller: "TelecomTelephonyAliasConfigurationLiveCallsEavesdropCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    params: function () {
                        return {
                            billingAccount: $stateParams.billingAccount,
                            serviceName: $stateParams.serviceName,
                            callId: call.id,
                            queueId: self.queueId,
                            apiEndpoint: self.apiEndpoint
                        };
                    }
                }
            });
        };
    }
});
