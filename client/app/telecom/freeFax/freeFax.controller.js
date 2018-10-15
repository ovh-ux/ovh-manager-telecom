angular.module('managerApp')
  .controller('FreeFaxCtrl', function ($q, $translate, $scope, OvhApiFreeFax, $stateParams, Toast) {
    const self = this;

    $scope.loading = true;
    this.serviceName = $stateParams.serviceName;

    function init() {
      OvhApiFreeFax.Aapi().details({
        serviceName: self.serviceName,
      }).$promise.then((freeFax) => {
        $scope.freeFax = freeFax;
        return OvhApiFreeFax.v6().voiceMailGetRouting({
          serviceName: self.serviceName,
        }).$promise.then((voiceMail) => {
          $scope.freeFax.voicemailActive = voiceMail.value === 'voicemail';
          return $scope.freeFax;
        });
      }).catch((err) => {
        if (err.status === 460) {
          self.error = $translate.instant('freefax_expired_error');
        } else {
          Toast.error($translate.instant('freefax_detail_error'));
        }
        return $q.reject(err);
      }).finally(() => {
        $scope.loading = false;
      });
    }

    init();
  });
