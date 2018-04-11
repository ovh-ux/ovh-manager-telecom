angular.module("managerApp").controller("TelecomTelephonyAliasConfigurationMembersEasyHuntingCtrl", function ($stateParams, $q, $translate, $timeout, OvhApiTelephony, Toast, ToastError) {
    "use strict";

    var self = this;

    function init () {

        self.loaders = {
            init: false
        };

        self.membersApi = {
            getMemberList: angular.noop, // provided by component
            addMembersToList: angular.noop, // provided by component
            fetchMembers: self.fetchMembers,
            reorderMembers: self.reorderMembers,
            fetchMemberDescription: self.fetchMemberDescription,
            swapMembers: self.swapMembers,
            updateMember: self.updateMember,
            deleteMember: self.deleteMember
        };

        self.membersAddApi = {
            addMembers: self.addMembers,
            getMemberList: function () {
                return self.membersApi.getMemberList();
            }
        };

        // load members list
        self.loaders.init = true;
        return self.fetchQueueId().then(function (id) {
            self.queueId = id;
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.loaders.init = false;
        });
    }

    self.fetchQueueId = function () {
        return OvhApiTelephony.EasyHunting().Hunting().Queue().v6().query({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.then(function (result) {
            return _.head(result);
        });
    };

    /**
     * ==================================================
     *          Members list component's API
     * ==================================================
     **/

    self.fetchMembers = function () {
        OvhApiTelephony.EasyHunting().Hunting().Agent().v6().resetAllCache();
        return OvhApiTelephony.EasyHunting().Hunting().Agent().v6().query({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.then(function (ids) {
            return $q.all(_.map(_.chunk(ids, 50), function (chunkIds) {
                return OvhApiTelephony.EasyHunting().Hunting().Agent().v6().getBatch({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName,
                    agentId: chunkIds
                }).$promise;
            })).then(function (chunkResult) {
                return _.pluck(_.flatten(chunkResult), "value");
            });
        });
    };

    self.reorderMembers = function (members) {
        var ids = _.pluck(members, "agentId");
        OvhApiTelephony.EasyHunting().Hunting().Queue().Agent().v6().resetAllCache();
        return $q.all(_.map(_.chunk(ids, 50), function (chunkIds) {
            return OvhApiTelephony.EasyHunting().Hunting().Queue().Agent().v6().getBatch({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName,
                queueId: self.queueId,
                agentId: chunkIds
            }).$promise;
        })).then(function (chunkResult) {
            return _.pluck(_.flatten(chunkResult), "value");
        }).then(function (orders) {
            _.each(orders, function (order) {
                var member = _.find(members, { agentId: order.agentId });
                if (member) {
                    member.position = order.position;
                }
            });
            return _.sortBy(members, "position");
        });
    };

    self.fetchMemberDescription = function (member) {
        return OvhApiTelephony.Service().v6().get({
            billingAccount: $stateParams.billingAccount,
            serviceName: member.number
        }).$promise.then(function (service) {
            return service.description;
        });
    };

    self.swapMembers = function (fromMember, toMember) {
        return OvhApiTelephony.EasyHunting().Hunting().Queue().Agent().v6().change({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName,
            queueId: self.queueId,
            agentId: fromMember.agentId
        }, {
            position: toMember.position
        }).$promise;
    };

    self.updateMember = function (member) {
        var attrs = ["status", "timeout", "wrapUpTime", "simultaneousLines"];
        return OvhApiTelephony.EasyHunting().Hunting().Agent().v6().change({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName,
            agentId: member.agentId
        }, _.pick(member, attrs)).$promise;
    };

    self.deleteMember = function (toDelete) {
        return OvhApiTelephony.EasyHunting().Hunting().Agent().v6().remove({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName,
            agentId: toDelete.agentId
        }).$promise;
    };

    /**
     * ==================================================
     *             Member add component's API
     * ==================================================
     **/

    self.addMembers = function (members) {

        var promise = $q.when();
        var agents = [];

        // create agents sequentialy to preserve order
        _.each(members.reverse(), function (member) {
            promise = promise.then(function () {
                return OvhApiTelephony.EasyHunting().Hunting().Agent().v6().create({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName
                }, member).$promise.then(function (agent) {
                    // put agent in the queue
                    return OvhApiTelephony.EasyHunting().Hunting().Agent().Queue().v6().create({
                        billingAccount: $stateParams.billingAccount,
                        serviceName: $stateParams.serviceName,
                        agentId: agent.agentId
                    }, {
                        position: 0,
                        queueId: self.queueId
                    }).$promise.then(function () {
                        agents.push(agent);
                        return agent;
                    });
                });
            });
        });

        return promise.then(function () {
            self.membersApi.addMembersToList(agents);
        });
    };

    init();
});
