angular.module('managerApp').controller('TelecomTelephonyAliasAdministrationCtrl', function ($translate, $stateParams, $scope) {
  const self = this;

  self.actions = null;

  /*= =====================================
    =            INITIALIZATION            =
    ====================================== */

  function init() {
    self.actions = [{
      name: 'number_to_line',
      sref: 'telecom.telephony.alias.administration.convertToLine',
      disabled: $scope.terminationTask,
      text: $translate.instant('telephony_alias_administration_actions_number_to_line'),
    }, {
      name: 'number_delete_line',
      sref: 'telecom.telephony.alias.administration.terminate',
      disabled: $scope.convertTask,
      text: $translate.instant('telephony_alias_administration_actions_number_delete_line'),
    }];
  }

  /* -----  End of INITIALIZATION  ------*/

  init();
});
