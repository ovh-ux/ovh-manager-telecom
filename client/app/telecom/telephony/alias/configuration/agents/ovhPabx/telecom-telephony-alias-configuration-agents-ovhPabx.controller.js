angular.module("managerApp").controller("TelecomTelephonyAliasConfigurationAgentsOvhPabxCtrl", function ($stateParams, $q, $translate, $uibModal, OvhApiTelephony, Toast, ToastError) {
    "use strict";

    var self = this;

    function init () {

        self.agents = {
            ids: [],
            paginated: [],
            selected: {},
            isLoading: false
        };

        self.addAgentForm = {
            numbers: [null],
            isAdding: false
        };

        return self.fetchAgentsIds().then(function (ids) {
            self.agents.ids = ids;
        }).catch(function (err) {
            return new ToastError(err);
        });
    }

    self.fetchAgentsIds = function () {
        self.agents.isLoading = true;
        return OvhApiTelephony.OvhPabx().Hunting().Agent().v6().query({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.finally(function () {
            self.agents.isLoading = false;
        });
    };

    self.fetchAgent = function (id) {
        return OvhApiTelephony.OvhPabx().Hunting().Agent().v6().get({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName,
            agentId: id
        }).$promise;
    };

    self.getSelectedAgentIds = function () {
        return _.keys(self.agents.selected);
    };

    self.deleteAgents = function () {
        self.agents.isDeleting = true;
        return $q.all(self.getSelectedAgentIds().map(function (id) {
            return OvhApiTelephony.OvhPabx().Hunting().Agent().v6().remove({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName,
                agentId: id
            }).$promise.then(function () {
                _.pull(self.agents.ids, parseInt(id, 10));
            });
        })).then(function () {
            Toast.success($translate.instant("telephony_alias_configuration_agents_delete_success"));
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.agents.isDeleting = false;
            self.agents.selected = {};
        });
    };

    self.startEdition = function (agent) {
        agent.inEdition = _.pick(agent, ["number", "simultaneousLines", "status", "timeout", "wrapUpTime"]);
    };

    self.isValidAgent = function (agent) {
        var valid = true;
        valid = valid && agent.number;
        valid = valid && /^\d{1,6}$/.test(agent.timeout);
        valid = valid && /^\d{1,6}$/.test(agent.wrapUpTime);
        valid = valid && /^([1-9]|10)$/.test(agent.simultaneousLines);
        return valid;
    };

    self.updateAgent = function (agent) {
        agent.isUpdating = true;
        return OvhApiTelephony.OvhPabx().Hunting().Agent().v6().change({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName,
            agentId: agent.agentId
        }, agent.inEdition).$promise.then(function () {
            _.assign(agent, agent.inEdition);
            agent.inEdition = null;
            Toast.success($translate.instant("telephony_alias_configuration_agents_update_success"));
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            agent.isUpdating = false;
        });
    };

    self.onChooseServicePopover = function (service, pos) {
        self.addAgentForm.numbers[pos] = service.serviceName;
    };

    self.cancelAddAgent = function (pos) {
        if (pos === 0 && self.addAgentForm.numbers.length > 1) {
            self.addAgentForm.numbers.shift();
        } else if (self.addAgentForm.numbers.length > 1) {
            _.pullAt(self.addAgentForm.numbers, pos);
        } else {
            self.addAgentForm.numbers[0] = null;
        }
    };

    self.addAgents = function () {
        const modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/telephony/alias/configuration/agents/ovhPabx/telecom-telephony-alias-configuration-agents-ovhPabx-modal.html",
            controller: "telecomTelephonyAliasConfigurationAgentsOvhPabxModal",
            controllerAs: "$ctrl"
        });
        modal.result.then(function () {
            self.addAgentForm.isAdding = true;
            return $q.all(self.addAgentForm.numbers.map(function (number) {
                if (!number || !number.length) {
                    return $q.when(null);
                }
                return OvhApiTelephony.OvhPabx().Hunting().Agent().v6().create({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName
                }, {
                    number: number,
                    simultaneousLines: 1,
                    status: "available",
                    timeout: 20,
                    wrapUpTime: 0
                }).$promise;
            })).then(function () {
                Toast.success($translate.instant("telephony_alias_configuration_agents_add_success"));
                return self.fetchAgentsIds().then(function (ids) {
                    self.agents.ids = ids;
                });
            }).catch(function (err) {
                return new ToastError(err);
            }).finally(function () {
                self.addAgentForm.isAdding = false;
                self.addAgentForm.numbers = [null];
            });

        });
    };

    init();
});
