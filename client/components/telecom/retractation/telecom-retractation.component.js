(function () {
    "use strict";

    angular.module("managerApp").component("telecomRetractation", {
        templateUrl: "components/telecom/retractation/telecom-retractation.html",
        bindings: {
            ngModel: "=?",
            ngDisabled: "=?"
        },
        controller: function ($translate, $translatePartialLoader) {
            var self = this;

            self.loading = {
                init: false
            };

            self.$onInit = function () {
                self.loading.init = true;
                $translatePartialLoader.addPart("../components/telecom/retractation");
                return $translate.refresh().finally(function () {
                    self.loading.init = false;
                });
            };
        }
    });
})();
