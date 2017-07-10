angular.module("managerApp").controller("TelecomTelephonyLineManagementOfferChangeCtrl", function ($q, $stateParams, $uibModal, $translate, TelephonyMediator, Toast) {
    "use strict";

    var self = this;

    self.group = null;
    self.line = null;
    self.pendingOfferChange = null;

    self.loading = {
        init: false
    };

    self.confirmCancel = false;
    self.initError = null;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function getPendingOfferChange () {
        return self.line.getOfferChange().catch(function (error) {
            Toast.error([$translate.instant("telephony_line_management_change_offer_change_error_init"), (error.data && error.data.message) || ""].join(" "));
            return $q.reject(error);
        });
    }

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.changeOffer = function () {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/telephony/line/management/offerChange/edit/telecom-telephony-line-management-offer-change-edit.html",
            controller: "TelecomTelephonyLineManagementOfferChangeEditCtrl",
            controllerAs: "OfferChangeEditCtrl",
            resolve: {
                currentLine: function () {
                    return self.line;
                }
            }
        });

        modal.result.then(angular.noop, function (error) {
            if (error) {
                if (error.type === "API" && !error.init) {
                    Toast.error([$translate.instant("telephony_line_management_change_offer_change_error_save"), (error.data && error.data.message) || ""].join(" "));
                } else if (error.type === "API" && error.init) {
                    Toast.error([$translate.instant("telephony_line_management_change_offer_change_error_init_modal"), (error.data && error.data.message) || ""].join(" "));
                }
                return $q.reject(error);
            }
            return $q.when(null);
        });

        return modal;
    };

    self.cancelOfferChange = function () {
        self.loading.cancel = true;

        return self.line.cancelOfferChange().then(function () {
            return self.line.getCurrentOfferInformations().then(function () {
                self.pendingOfferChange = null;
                self.confirmCancel = false;
            });
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_line_management_change_offer_change_pending_cancel_error"), (error.data && error.data.message) || ""].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.cancel = false;
        });
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.init = true;

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.group = group;
            self.line = self.group.getLine($stateParams.serviceName);

            return $q.all([
                self.line.getCurrentOfferInformations(),
                getPendingOfferChange()
            ]).then(angular.noop, function (firstError) {
                Toast.error([$translate.instant("telephony_line_management_change_offer_change_error_init"), (firstError.data && firstError.data.message) || ""].join(" "));
                self.initError = firstError;
                return $q.reject();
            });
        }, function (error) {
            Toast.error([$translate.instant("telephony_line_management_change_offer_change_error_init"), (error.data && error.data.message) || ""].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

});
