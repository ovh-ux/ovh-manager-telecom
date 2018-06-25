angular.module('managerApp').controller('OverTheBoxLogsCtrl', function ($scope, $stateParams, OvhApiOverTheBox, OvhTailLogs) {
  const self = this;

  self.logger = null;

  self.stopLog = function () {
    self.logger.stop();
  };

  self.startLog = function () {
    self.logger.log();
  };

  self.getLogs = function () {
    self.logger = self.logger.logs;
    return self.logger;
  };

  function init() {
    self.logger = new OvhTailLogs({
      source() {
        return OvhApiOverTheBox.v6().getLogs({
          serviceName: $stateParams.serviceName,
        }, {}).$promise.then(logs => logs.url);
      },
      delay: 2000,
    });

    self.startLog();
  }


  init();

  $scope.$on('$destroy', () => {
    self.logger.stop();
  });
});
