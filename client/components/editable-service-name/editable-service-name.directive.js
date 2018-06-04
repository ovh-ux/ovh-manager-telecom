angular.module('managerApp').directive('editableServiceName', $timeout => ({
  restrict: 'E',
  templateUrl: 'components/editable-service-name/editable-service-name.html',
  scope: {
    title: '=editableServiceNameTitle',
    serviceName: '=editableServiceNameServiceName',
    onEditStart: '&?editableServiceNameTitleOnEditStart',
    onEditCancel: '&?editableServiceNameTitleOnEditCancel',
    onSave: '&editableServiceNameTitleOnSave', // MUST BE a promise
    maxlength: '@',
    disabled: '=',
  },
  bindToController: true,
  controllerAs: '$ctrl',
  controller: 'EditableServiceNameCtrl',
  link($scope, $element, attributes, editableServiceNameCtrl) {
    $scope.$watch('$ctrl.inEdition', (isInEdition) => {
      if (isInEdition) {
        $timeout(() => {
          $element.find('input.service-name-edit-input').select();
        });
      }
    });

    $element.on('keydown blur', 'input.service-name-edit-input', (event) => {
      if (event.type === 'keydown') {
        if (event.keyCode === 27) { // if ESC is pressed
          editableServiceNameCtrl.cancelEdition();
          $scope.$apply();
        }
      }
    });

    $scope.$on('$destroy', () => {
      $element.off('keydown');
    });
  },
}));
