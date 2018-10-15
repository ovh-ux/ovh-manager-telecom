angular.module('managerApp').controller('TelecomTelephonyAliasConfigurationMembersOldPabxCtrl', function ($q, $stateParams, $translate, TelephonyMediator, Toast, OvhApiTelephony, OvhApiTelephonyEasyPabx, OvhApiTelephonyMiniPabx) {
  const self = this;
  let apiService;

  self.loaders = {
    init: false,
    editing: false,
    deleting: false,
    adding: false,
  };

  self.sortableAgentsOpts = {
    handle: '.ovh-font-grip',
    axis: 'y',
    start() {
      self.agentsBeforeDrag = angular.copy(self.agents);
    },
    stop() {
      self.onMoveAgent();
    },
    disabled: false,
  };

  self.number = null;
  self.agents = [];
  self.agentInEdition = null;
  self.agentToDelete = null;
  self.agentsBeforeDrag = null;
  self.addAgentForm = {
    numbers: [null],
    options: {
      noReplyTimer: 20,
    },
  };
  self.servicesToExclude = [];

  /* ==============================
  =            HELPERS            =
  =============================== */

  function fetchDescription(serviceName) {
    if (serviceName.length < 5) {
      return $q.when(null);
    }

    return OvhApiTelephony.v6().searchService({
      axiom: serviceName,
    }).$promise.then((result) => {
      const firstMatch = _.first(result);
      if (firstMatch) {
        return OvhApiTelephony.Service().v6().get({
          billingAccount: firstMatch.billingAccount,
          serviceName: firstMatch.domain,
        }).$promise;
      }

      return null;
    });
  }

  function fetchAgent(agentNumber, checkDescription) {
    return apiService.v6().getAgent({
      billingAccount: $stateParams.billingAccount,
      serviceName: $stateParams.serviceName,
      agentNumber,
    }).$promise.then((agent) => {
      if (checkDescription) {
        fetchDescription(agent.agentNumber).then((service) => {
          _.set(agent, 'description', service && service.description !== agent.agentNumber ? service.description : agent.agentNumber);
        });
      }

      return agent;
    });
  }

  function fetchAgents() {
    return apiService.v6().queryAgent({
      billingAccount: $stateParams.billingAccount,
      serviceName: $stateParams.serviceName,
    }).$promise.then((agentNumbers) => {
      const agentPromises = [];
      agentNumbers.forEach((agentNumber) => {
        agentPromises.push(fetchAgent(agentNumber, true).then((agent) => {
          self.agents.push(agent);
          return agent;
        }));
      });

      return $q.all(agentPromises).then(() => {
        self.agents = _.sortBy(self.agents, 'position');
        return self.agents;
      });
    });
  }

  function changeAgentPosition(agent) {
    return apiService.v6().saveAgent({
      billingAccount: $stateParams.billingAccount,
      serviceName: $stateParams.serviceName,
      agentNumber: agent.agentNumber,
    }, {
      position: agent.position,
    }).$promise;
  }

  function getServicesToExclude() {
    self.servicesToExclude = _.pluck(self.agents, 'agentNumber').concat(self.addAgentForm.numbers);
  }

  self.hasAgentEditedChanged = function (agent) {
    return !angular.equals(agent, self.agentInEdition);
  };

  self.reorderAgents = function (fromPosition) {
    const reorderPromises = [];

    // get agent to reorder
    _.filter(self.agents, agent => agent.position > fromPosition).forEach((agent) => {
      reorderPromises.push(apiService.v6().saveAgent({
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
        agentNumber: agent.agentNumber,
      }, {
        position: agent.position - 1,
      }).$promise);
    });

    return $q.all(reorderPromises);
  };

  /* -----  End of HELPERS  ------ */

  /* =============================
  =            EVENTS            =
  ============================== */

  /* ----------  Agent edition  ---------- */

  self.onAgentEditBtnClick = function (agent) {
    self.agentInEdition = angular.copy(agent);
    self.agentInEdition.noReplyTimer = agent.noReplyTimer ? agent.noReplyTimer : 1;
  };

  self.onAgentEditCancelBtnClick = function () {
    self.agentInEdition = null;
  };

  self.onAgentFormSubmit = function () {
    const attrs = ['logged', 'noReplyTimer'];

    self.loaders.editing = true;

    return apiService.v6().saveAgent({
      billingAccount: $stateParams.billingAccount,
      serviceName: $stateParams.serviceName,
      agentNumber: self.agentInEdition.agentNumber,
    }, _.pick(self.agentInEdition, attrs)).$promise.then(() => {
      Toast.success($translate.instant('telephony_alias_members_change_success'));
      const toUpdate = _.find(self.agents, { agentNumber: self.agentInEdition.agentNumber });
      _.assign(toUpdate, _.pick(self.agentInEdition, attrs));
      self.onAgentEditCancelBtnClick();
    }).catch((error) => {
      Toast.error([$translate.instant('an_error_occured'), _.get(error, 'data.message')].join(' '));
      return $q.error(error);
    }).finally(() => {
      self.loaders.editing = false;
    });
  };

  /* ----------  Agent delete  ---------- */

  self.onConfirmAgentDeleteBtnClick = function (agent) {
    self.loaders.deleting = true;

    return apiService.v6().deleteAgent({
      billingAccount: $stateParams.billingAccount,
      serviceName: $stateParams.serviceName,
      agentNumber: self.agentToDelete.agentNumber,
    }).$promise.then(() => {
      self.agentToDelete = null;
      Toast.success($translate.instant('telephony_alias_members_delete_success'));
      _.remove(self.agents, a => a.agentNumber === agent.agentNumber);
      getServicesToExclude();
      return self.reorderAgents(agent.position);
    }, (error) => {
      Toast.error([$translate.instant('an_error_occured'), _.get(error, 'data.message')].join(' '));
      return $q.reject(error);
    }).finally(() => {
      self.loaders.deleting = false;
    });
  };

  /* ----------  Agent move  ---------- */

  self.onSwapAgents = function (fromAgent, toAgent) {
    // we do it by hand first so the ui is refreshed immediately
    const fromPos = fromAgent.position;
    const toPos = toAgent.position;
    _.set(fromAgent, 'position', toPos);
    _.set(toAgent, 'position', fromPos);
    self.agents = _.sortBy(self.agents, 'position');

    self.sortableAgentsOpts.disabled = true;
    return changeAgentPosition(fromAgent)
      .then(() => changeAgentPosition(toAgent)).catch((error) => {
        // revert changes
        _.set(fromAgent, 'position', fromPos);
        _.set(toAgent, 'position', toPos);
        Toast.error([$translate.instant('an_error_occured'), _.get(error, 'data.message')].join(' '));
        self.agents = _.sortBy(self.agents, 'position');
        return $q.reject(error);
      }).finally(() => {
        self.sortableAgentsOpts.disabled = false;
      });
  };

  self.onMoveAgent = function () {
    self.sortableAgentsOpts.disabled = true;
    const movePromises = [];

    self.agents.forEach((agent, index) => {
      _.set(agent, 'position', index + 1);
      movePromises.push(changeAgentPosition(agent));
    });

    return $q.all(movePromises).catch((error) => {
      Toast.error([$translate.instant('an_error_occured'), _.get(error, 'data.message')].join(' '));
    }).finally(() => {
      self.sortableAgentsOpts.disabled = false;
    });
  };

  /* ----------  Agent add  ---------- */

  self.onChooseServicePopover = function (service, pos) {
    self.addAgentForm.numbers[pos] = service.serviceName;
    getServicesToExclude();
  };

  self.addAgents = function (form) {
    const addPromises = [];

    self.loaders.adding = true;

    _.filter(self.addAgentForm.numbers, number => number && number.length)
      .forEach((number, index) => {
        addPromises.push(apiService.v6().createAgent({
          billingAccount: $stateParams.billingAccount,
          serviceName: $stateParams.serviceName,
        }, {
          logged: true,
          agentNumber: number,
          noReplyTimer: self.addAgentForm.options.noReplyTimer,
          position: self.agents.length + (index + 1),
        }).$promise.then((agent) => {
          self.agents.push(agent);
          self.agents = _.sortBy(self.agents, 'position');
          fetchDescription(agent.agentNumber).then((service) => {
            _.set(agent, 'description', service && service.description !== agent.agentNumber ? service.description : agent.agentNumber);
          });
        }));
      });

    return $q.all(addPromises).then(() => {
      Toast.success($translate.instant('telephony_alias_members_add_success'));
      self.resetAgentAddForm();
      form.$setPristine();
      getServicesToExclude();
    }).catch((error) => {
      Toast.error([$translate.instant('an_error_occured'), _.get(error, 'data.message')].join(' '));
    }).finally(() => {
      self.loaders.adding = false;
    });
  };

  self.resetAgentAddForm = function () {
    self.addAgentForm.numbers = [null];
    self.addAgentForm.options = {
      noReplyTimer: 20,
    };
  };

  self.removeAgentAt = function (index) {
    if (index === 0 && self.addAgentForm.numbers.length === 1) {
      self.addAgentForm.numbers[0] = null;
    } else {
      _.pullAt(self.addAgentForm.numbers, index);
    }
  };

  /* -----  End of EVENTS  ------ */

  /* =====================================
  =            INITIALIZATION            =
  ====================================== */

  self.$onInit = function () {
    self.loaders.init = true;

    return TelephonyMediator.getGroup($stateParams.billingAccount).then((group) => {
      self.number = group.getNumber($stateParams.serviceName);
      apiService = self.number.feature.featureType === 'easyPabx' ? OvhApiTelephonyEasyPabx : OvhApiTelephonyMiniPabx;

      return fetchAgents().then(() => {
        getServicesToExclude();
      });
    }).catch((error) => {
      Toast.error([$translate.instant('telephony_alias_configuration_members_old_pabx_load_error'), _.get(error, 'data.message')].join(' '));
      return $q.reject(error);
    }).finally(() => {
      self.loaders.init = false;
    });
  };

  /* -----  End of INITIALIZATION  ------ */
});
