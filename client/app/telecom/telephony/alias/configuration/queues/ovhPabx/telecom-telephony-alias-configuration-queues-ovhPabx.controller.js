angular.module("managerApp").controller("TelecomTelephonyAliasConfigurationQueuesOvhPabxCtrl", function ($stateParams, $q, $translate, $timeout, $uibModal, OvhApiTelephony, Toast, ToastError) {
    "use strict";

    var self = this;

    function init () {
        self.queues = null;
        return $q.all({
            queues: self.fetchQueues(),
            agents: self.fetchAgents(),
            sounds: self.fetchSounds(),
            enums: self.fetchEnums()
        }).then(function (result) {
            self.enums = result.enums;
            self.queues = result.queues;
            self.agents = result.agents;
            self.sounds = result.sounds;
            if (self.queues.length) {
                _.first(self.queues).isOpen = true;
            }
        }).catch(function (err) {
            return new ToastError(err);
        });
    }

    self.fetchEnums = function () {
        return OvhApiTelephony.v6().schema().$promise.then(function (result) {
            return {
                strategy: _.get(result, ["models", "telephony.OvhPabxHuntingQueueStrategyEnum", "enum"])
            };
        });
    };

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
                    return self.bindQueueAgentsApi(queue);
                });
            }));
        });
    };

    self.bindQueueAgentsApi = function (queue) {
        queue.agentsApi = {
            getMemberList: angular.noop, // api provided by component
            addMembersToList: angular.noop, // api provided by component
            fetchMembers: function () {
                return self.fetchAgentsOfQueue(queue);
            },
            reorderMembers: function (agents) {
                return self.reorderAgentsOfQueue(queue, agents);
            },
            fetchMemberDescription: self.fetchAgentDescription,
            swapMembers: function (from, to) {
                return self.swapAgentsOfQueue(queue, from, to);
            },
            updateMember: self.updateAgent,
            deleteMember: function (agent) {
                return self.deleteAgentFromQueue(queue, agent);
            }
        };
        return queue;
    };

    self.fetchSounds = function () {
        return OvhApiTelephony.OvhPabx().Sound().v6().query({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.then(function (ids) {
            return $q.all(_.map(ids, function (id) {
                return OvhApiTelephony.OvhPabx().Sound().v6().get({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName,
                    soundId: id
                }).$promise;
            }));
        });
    };

    self.findSoundById = function (soundId) {
        return _.find(self.sounds, { soundId: parseInt("" + soundId, 10) });
    };

    self.fetchAgents = function () {
        return OvhApiTelephony.OvhPabx().Hunting().Agent().v6().query({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.then(function (ids) {
            return $q.all(_.map(_.chunk(ids, 50), function (chunkIds) {
                return OvhApiTelephony.OvhPabx().Hunting().Agent().v6().getBatch({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName,
                    agentId: chunkIds
                }).$promise;
            })).then(function (chunkResult) {
                return _.pluck(_.flatten(chunkResult), "value");
            });
        });
    };

    self.fetchAgentsOfQueue = function (queue) {
        return OvhApiTelephony.OvhPabx().Hunting().Queue().Agent().v6().query({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName,
            queueId: queue.queueId
        }).$promise.then(function (ids) {
            return $q.all(_.map(_.chunk(ids, 50), function (chunkIds) {
                return OvhApiTelephony.OvhPabx().Hunting().Agent().v6().getBatch({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName,
                    agentId: chunkIds
                }).$promise;
            })).then(function (chunkResult) {
                return _.pluck(_.flatten(chunkResult), "value");
            });
        });
    };

    self.fetchAgentDescription = function (agent) {
        return OvhApiTelephony.Service().v6().get({
            billingAccount: $stateParams.billingAccount,
            serviceName: agent.number
        }).$promise.then(function (service) {
            return service.description;
        });
    };

    self.reorderAgentsOfQueue = function (queue, agents) {
        var ids = _.pluck(agents, "agentId");
        OvhApiTelephony.OvhPabx().Hunting().Queue().Agent().v6().resetAllCache();
        return $q.all(_.map(_.chunk(ids, 50), function (chunkIds) {
            return OvhApiTelephony.OvhPabx().Hunting().Queue().Agent().v6().getBatch({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName,
                queueId: queue.queueId,
                agentId: chunkIds
            }).$promise;
        })).then(function (chunkResult) {
            return _.pluck(_.flatten(chunkResult), "value");
        }).then(function (orders) {
            _.each(orders, function (order) {
                var agent = _.find(agents, { agentId: order.agentId });
                if (agent) {
                    agent.position = order.position;
                }
            });
            return _.sortBy(agents, "position");
        });
    };

    self.swapAgentsOfQueue = function (queue, fromAgent, toAgent) {
        return OvhApiTelephony.OvhPabx().Hunting().Queue().Agent().v6().change({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName,
            queueId: queue.queueId,
            agentId: fromAgent.agentId
        }, {
            position: toAgent.position
        }).$promise;
    };

    self.updateAgent = function (agent) {
        var attrs = ["status", "timeout", "wrapUpTime", "simultaneousLines"];
        return OvhApiTelephony.OvhPabx().Hunting().Agent().v6().change({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName,
            agentId: agent.agentId
        }, _.pick(agent, attrs)).$promise;
    };

    self.deleteAgentFromQueue = function (queue, toDelete) {
        return OvhApiTelephony.OvhPabx().Hunting().Queue().Agent().v6().remove({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName,
            queueId: queue.queueId,
            agentId: toDelete.agentId
        }).$promise;
    };

    self.createQueue = function () {
        self.isCreating = true;
        return OvhApiTelephony.OvhPabx().Hunting().Queue().v6().create({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, {
            strategy: "sequentiallyByAgentOrder"
        }).$promise.then(function () {
            Toast.success($translate.instant("telephony_alias_configuration_queues_queue_create_success"));
            return self.fetchQueues().then(function (queues) {
                self.queues = queues;
            });
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isCreating = false;
        });
    };

    self.deleteQueue = function (queue) {
        self.isDeleting = true;
        return OvhApiTelephony.OvhPabx().Hunting().Queue().v6().remove({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName,
            queueId: queue.queueId
        }).$promise.then(function () {
            _.remove(self.queues, { queueId: queue.queueId });
            Toast.success($translate.instant("telephony_alias_configuration_queues_queue_delete_success"));
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isDeleting = false;
        });
    };

    self.getAgentsQueueToAdd = function (queue) {
        var queueAgents = queue.agentsApi.getMemberList();
        return _.filter(self.agents, function (agent) {
            return !_.find(queueAgents, { agentId: agent.agentId });
        });
    };

    self.addAgentToQueue = function (queue) {
        const modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/telephony/alias/configuration/queues/ovhPabx/telecom-telephony-alias-configuration-queues-ovhPabx-modal.html",
            controller: "telecomTelephonyAliasConfigurationQueuesOvhPabxCtrlModal",
            controllerAs: "$ctrl"
        });
        modal.result.then(function () {
            queue.isAdding = true;
            return OvhApiTelephony.OvhPabx().Hunting().Agent().v6().addToQueue({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName,
                agentId: queue.agentToAdd
            }, {
                queueId: queue.queueId,
                position: 0
            }).$promise.then(function () {
                var added = _.find(self.agents, { agentId: queue.agentToAdd });
                queue.agentsApi.addMembersToList([added]);
                queue.agentToAdd = null;
                queue.addAgent = false;
                Toast.success($translate.instant("telephony_alias_configuration_queues_agent_add_success"));
            }).catch(function (err) {
                return new ToastError(err);
            }).finally(function () {
                queue.isAdding = false;
            });
        });
    };

    self.startQueueEdition = function (queue) {
        queue.inEdition = _.pick(queue, [
            "description",
            "strategy",
            "followCallForwards",
            "maxMember",
            "maxWaitTime",
            "soundOnHold",
            "actionOnOverflowParam"
        ]);
    };

    self.hasQueueInEditionChanges = function (queue) {
        var attrs = [
            "description",
            "strategy",
            "followCallForwards",
            "maxMember",
            "maxWaitTime",
            "soundOnHold",
            "actionOnOverflowParam"
        ];
        return !angular.equals(_.pick(queue, attrs), _.pick(queue.inEdition, attrs));
    };

    self.updateQueue = function (queue) {
        queue.isUpdating = true;
        return OvhApiTelephony.OvhPabx().Hunting().Queue().v6().change({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName,
            queueId: queue.queueId
        }, {
            description: queue.inEdition.description,
            strategy: queue.inEdition.strategy,
            followCallForwards: queue.inEdition.followCallForwards,
            maxMember: queue.inEdition.maxMember,
            maxWaitTime: queue.inEdition.maxWaitTime,
            soundOnHold: queue.inEdition.soundOnHold || null,
            actionOnOverflow: queue.inEdition.actionOnOverflowParam ? "playback" : null,
            actionOnOverflowParam: queue.inEdition.actionOnOverflowParam || null
        }).$promise.then(function () {
            _.assign(queue, queue.inEdition);
            queue.inEdition = null;
            Toast.success($translate.instant("telephony_alias_configuration_queues_queue_update_success"));
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            queue.isUpdating = true;
        });
    };

    self.openManageSoundsHelper = function (queue, toneType) {
        self.managingSounds = true;
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "components/telecom/alias/hunting/sounds/telecom-telephony-alias-hunting-sounds.html",
            controller: "TelecomTelephonyAliasHuntingSoundsCtrl",
            controllerAs: "$ctrl",
            resolve: {
                params: function () {
                    return {
                        sounds: self.sounds,
                        apiEndpoint: OvhApiTelephony.OvhPabx(),
                        refreshSounds: function () {
                            return self.fetchSounds().then(function (sounds) {
                                // we mutate sounds array because it is used in the modal aswell
                                self.sounds.length = 0;
                                Array.prototype.push.apply(self.sounds, sounds);
                            }).catch(function (err) {
                                return new ToastError(err);
                            });
                        }
                    };
                }
            }
        });
        modal.result.then(function (sound) {
            if (sound) {
                queue.inEdition[toneType] = sound.soundId;
            }
        }).finally(function () {
            self.managingSounds = false;
        });
        return modal;
    };

    self.filterDescription = function (valueParam) {
        var value = valueParam;
        if (value) {
            // limits description characters range
            value = value.replace(/[^àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœa-zA-Z0-9_-\s]/g, "");

            // limits description length
            value = value.slice(0, 100);
        }
        return value;
    };

    init();
});
