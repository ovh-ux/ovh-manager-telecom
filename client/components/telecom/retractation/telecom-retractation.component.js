(function () {
  angular.module('managerApp').component('telecomRetractation', {
    templateUrl: 'components/telecom/retractation/telecom-retractation.html',
    bindings: {
      ngModel: '=?',
      ngDisabled: '=?',
    },
    controller($translate, $translatePartialLoader) {
      const self = this;

      self.loading = {
        init: false,
      };

      self.$onInit = function () {
        self.loading.init = true;
        $translatePartialLoader.addPart('../components/telecom/retractation');
        return $translate.refresh().finally(() => {
          self.loading.init = false;
        });
      };
    },
  });
}());
