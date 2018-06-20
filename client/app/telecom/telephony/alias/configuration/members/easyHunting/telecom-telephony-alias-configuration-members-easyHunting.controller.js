angular.module('managerApp').controller('TelecomTelephonyAliasConfigurationMembersEasyHuntingCtrl', function ($stateParams, $q, $translate, $timeout, OvhApiTelephony, Toast, ToastError) {
  const self = this;

  function init() {
    self.loaders = {
      init: false,
    };

    self.membersApi = {
      getMemberList: angular.noop, // provided by component
      addMembersToList: angular.noop, // provided by component
      fetchMembers: self.fetchMembers,
      reorderMembers: self.reorderMembers,
      fetchMemberDescription: self.fetchMemberDescription,
      swapMembers: self.swapMembers,
      updateMember: self.updateMember,
      deleteMember: self.deleteMember,
    };

    self.membersAddApi = {
      addMembers: self.addMembers,
      getMemberList() {
        return self.membersApi.getMemberList();
      },
    };

    // load members list
    self.loaders.init = true;
    return self.fetchQueueId().then((id) => {
      self.queueId = id;
    }).catch(err => new ToastError(err)).finally(() => {
      self.loaders.init = false;
    });
  }

  self.fetchQueueId = function () {
    return OvhApiTelephony.EasyHunting().Hunting().Queue().v6()
      .query({
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
      }).$promise.then(result => _.head(result));
  };

  /**
   * ==================================================
   *          Members list component's API
   * ==================================================
   * */

  self.fetchMembers = function () {
    OvhApiTelephony.EasyHunting().Hunting().Agent().v6()
      .resetAllCache();
    return OvhApiTelephony.EasyHunting().Hunting().Agent().v6()
      .query({
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
      }).$promise
      .then(ids => $q.all(_.map(_.chunk(ids, 50), chunkIds =>
        OvhApiTelephony.EasyHunting().Hunting().Agent().v6()
          .getBatch({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName,
            agentId: chunkIds,
          }).$promise))
        .then(chunkResult => _.pluck(_.flatten(chunkResult), 'value')));
  };

  self.reorderMembers = function (members) {
    const ids = _.pluck(members, 'agentId');
    OvhApiTelephony.EasyHunting().Hunting().Queue().Agent()
      .v6()
      .resetAllCache();
    return $q.all(_.map(_.chunk(ids, 50), chunkIds =>
      OvhApiTelephony.EasyHunting().Hunting().Queue().Agent()
        .v6()
        .getBatch({
          billingAccount: $stateParams.billingAccount,
          serviceName: $stateParams.serviceName,
          queueId: self.queueId,
          agentId: chunkIds,
        }).$promise))
      .then(chunkResult => _.pluck(_.flatten(chunkResult), 'value'))
      .then((orders) => {
        _.each(orders, (order) => {
          const member = _.find(members, { agentId: order.agentId });
          if (member) {
            member.position = order.position;
          }
        });
        return _.sortBy(members, 'position');
      });
  };

  self.fetchMemberDescription = function (member) {
    return OvhApiTelephony.Service().v6().get({
      billingAccount: $stateParams.billingAccount,
      serviceName: member.number,
    }).$promise.then(service => service.description);
  };

  self.swapMembers = function (fromMember, toMember) {
    return OvhApiTelephony.EasyHunting().Hunting().Queue().Agent()
      .v6()
      .change({
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
        queueId: self.queueId,
        agentId: fromMember.agentId,
      }, {
        position: toMember.position,
      }).$promise;
  };

  self.updateMember = function (member) {
    const attrs = ['status', 'timeout', 'wrapUpTime', 'simultaneousLines'];
    return OvhApiTelephony.EasyHunting().Hunting().Agent().v6()
      .change({
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
        agentId: member.agentId,
      }, _.pick(member, attrs)).$promise;
  };

  self.deleteMember = function (toDelete) {
    return OvhApiTelephony.EasyHunting().Hunting().Agent().v6()
      .remove({
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
        agentId: toDelete.agentId,
      }).$promise;
  };

  /**
   * ==================================================
   *             Member add component's API
   * ==================================================
   * */

  self.addMembers = function (members) {
    let promise = $q.when();
    const agents = [];

    // create agents sequentialy to preserve order
    _.each(members.reverse(), (member) => {
      promise = promise.then(() => OvhApiTelephony.EasyHunting().Hunting().Agent().v6()
        .create({
          billingAccount: $stateParams.billingAccount,
          serviceName: $stateParams.serviceName,
        }, member).$promise.then(agent =>
        // put agent in the queue
          OvhApiTelephony.EasyHunting().Hunting().Agent().Queue()
            .v6()
            .create({
              billingAccount: $stateParams.billingAccount,
              serviceName: $stateParams.serviceName,
              agentId: agent.agentId,
            }, {
              position: 0,
              queueId: self.queueId,
            }).$promise.then(() => {
              agents.push(agent);
              return agent;
            })));
    });

    return promise.then(() => {
      self.membersApi.addMembersToList(agents);
    });
  };

  init();
});
