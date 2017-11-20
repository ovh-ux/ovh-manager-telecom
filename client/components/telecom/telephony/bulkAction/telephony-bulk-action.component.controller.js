angular.module("managerApp").controller("telephonyBulkActionCtrl", function ($translate, $translatePartialLoader, $uibModal) {
    "use strict";

    var self = this;

    self.loading = {
        init: false
    };

    /* =============================
    =            EVENTS            =
    ============================== */

    self.onBulkActionBtnClick = function () {
        $uibModal.open({
            templateUrl: "components/telecom/telephony/bulkAction/modal/telephony-bulk-action-modal.html",
            controller: "telephonyBulkActionModalCtrl",
            controllerAs: "$ctrl",
            resolve: {
                modalBindings: {
                    serviceType: self.serviceType,
                    billingAccount: self.billingAccount,
                    serviceName: self.serviceName
                }
            }
        });
    };

    /* -----  End of EVENTS  ------ */


    /* =====================================
    =            INITIALIZATION            =
    ====================================== */

    function getTranslations () {
        $translatePartialLoader.addPart("../components/telecom/telephony/bulkAction");
        return $translate.refresh();
    }

    self.$onInit = function () {
        self.loading.init = true;

        // check for attributes
        // check for serviceType : line or number - default to line
        if (["line", "number"].indexOf(self.serviceType)) {
            self.serviceType = "line";
        }

        // load translation
        return getTranslations().finally(function () {
            self.loading.init = false;
        });
    };

    /* -----  End of INITIALIZATION  ------ */

});
