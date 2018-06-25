angular.module('ovhPassword', []).directive('ovhPassword', () => ({
  restrict: 'EA',
  scope: {
    ovhPwd: '=',
    ovhPwdConfirm: '=',
  },
  replace: true,
  templateUrl: 'components/ovh-password/ovh-password.html',
  link($scope) {
    // We use an isolate scope, so define here some properties.
    $scope.password = {};
    $scope.password.value = $scope.ovhPwd;
    $scope.password.confirm = $scope.ovhPwdConfirm;

    $scope.$watch('password.value', (newValue) => {
      $scope.ovhPwd = newValue;
    });

    $scope.$watch('password.confirm', (newValue) => {
      $scope.ovhPwdConfirm = newValue;
    });
  },
}));

angular.module('managerApp').config(($ovhpopoverProvider) => {
  angular.extend($ovhpopoverProvider.defaults, {
    animation: 'flat-fade',
  });
});
