angular.module('managerApp').service('PackXdslModemMediator', function ($rootScope, $q, $translate, OvhApiXdsl, Poller) {
  const self = this;

  this.capabilities = {
    canBeManagedByOvh: true,
  };
  this.tasks = {};
  this.info = {};

  const pollModem = function (namespace, serviceName, callbackError) {
    function success(results) {
      self.capabilities = results.capabilities.data;

      // throw rising tasks
      _.forEach(results.current.data, (state, key) => {
        if (state && !self.tasks[key]) {
          self.raiseTask(key, true, true);
        }
      });

      // throw falling tasks
      _.forEach(self.tasks, (state, key) => {
        if (state && !results.current.data[key]) {
          self.raiseTask(key, false, true);
        }
      });
    }

    function error(err) {
      if (!_.isEmpty(err)) {
        callbackError(err);
      }
    }

    OvhApiXdsl.Modem().Aapi().poll(null, {
      xdslId: serviceName,
      namespace,
    }).then(
      success,
      error,
      success,
    );
  };

  this.setTask = function (name) {
    this.tasks[name] = true;
  };

  this.unsetTask = function (name) {
    delete this.tasks[name];
  };

  this.disableCapabilities = function () {
    this.capabilities = _.mapValues(this.capabilities, (val, key) => {
      if (key === 'canBeManagedByOvh' || key === 'canChangeMtu') {
        return val;
      }
      return false;
    });
  };

  this.raiseTask = function (name, state, byPassFlag) {
    $rootScope.$broadcast(`pack_xdsl_modem_task_${name}`, state);
    if (state) {
      this.setTask(name);
    } else {
      this.unsetTask(name);
    }
    if (!byPassFlag) {
      $rootScope.$broadcast('pack_xdsl_modem_task', self.tasks);
    }
  };

  this.open = function (serviceName, callbackError) {
    return OvhApiXdsl.Modem().Aapi().get({
      xdslId: serviceName,
    }).$promise.then((data) => {
      self.capabilities = data.capabilities;
      self.info = _.omit(data, ['capabilities']);
      pollModem('packXdslModemTasks', serviceName, callbackError);
      return data;
    }).catch(err => $q.reject(err));
  };

  this.close = function () {
    Poller.kill({
      namespace: 'packXdslModemTasks',
    });
  };
});
