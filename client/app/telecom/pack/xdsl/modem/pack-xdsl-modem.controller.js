angular.module('managerApp')
  .controller('XdslModemCtrl', function ($scope, $stateParams, $translate, $q, OvhApiXdsl, Toast, TucPackXdslModemMediator) {
    const self = this;

    this.getAccessName = function () {
      return OvhApiXdsl.v6().get({
        xdslId: $stateParams.serviceName,
      }).$promise.then((access) => {
        self.serviceName = access.description || access.packName;
        return access;
      }).catch((err) => {
        Toast.error($translate.instant('xdsl_model_access_error'));
        return $q.reject(err);
      });
    };

    function init() {
      self.mediator = TucPackXdslModemMediator;
      self.loaders = {
        modem: true,
      };
      self.number = $stateParams.number;

      $scope.$on('changeAccessNameEvent', (event, data) => {
        if ($stateParams.serviceName === data.xdslId) {
          self.serviceName = data.description;
        }
      });

      $q.all([
        TucPackXdslModemMediator.open(
          $stateParams.serviceName,
          () => {
            Toast.error($translate.instant('xdsl_model_task_error'));
          },
        ),
        self.getAccessName(),
      ]).finally(() => {
        self.loaders.modem = false;
      });

      $scope.$on('$destroy', () => {
        TucPackXdslModemMediator.close();
      });
    }

    init();
  });
