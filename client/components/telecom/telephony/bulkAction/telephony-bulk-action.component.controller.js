angular.module("managerApp").controller("telephonyBulkActionCtrl", function ($q, $translate, $translatePartialLoader, $uibModal) {
    "use strict";

    var self = this;

    self.loading = {
        init: false
    };

    /* =============================
    =            EVENTS            =
    ============================== */

    self.onBulkActionBtnClick = function () {
        return $uibModal.open({
            templateUrl: "components/telecom/telephony/bulkAction/modal/telephony-bulk-action-modal.html",
            controller: "telephonyBulkActionModalCtrl",
            controllerAs: "$ctrl",
            resolve: {
                modalBindings: {
                    serviceType: self.serviceType,
                    billingAccount: self.billingAccount,
                    serviceName: self.serviceName,
                    bulkInfos: self.bulkInfos,
                    getBulkParams: self.getBulkParams
                }
            }
        }).result.then(function (data) {
            if (self.onSuccess && _.isFunction(self.onSuccess())) {
                self.onSuccess()(data);
            }
        }).catch(function (error) {
            if (_.get(error, "type") === "API" && self.onError && _.isFunction(self.onError())) {
                self.onError()(error);
            }
            return $q.reject(error);
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
