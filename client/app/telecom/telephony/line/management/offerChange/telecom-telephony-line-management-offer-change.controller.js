angular.module("managerApp").controller("TelecomTelephonyLineManagementOfferChangeCtrl", function ($q, $stateParams, $translate, TelephonyMediator, Toast) {
    "use strict";

    var self = this;

    self.loading = {
        init: false,
        save: false,
        cancel: false
    };

    self.group = null;
    self.line = null;
    self.availableOffers = null;

    self.model = {
        offer: null,
        isEditing: false
    };

    self.initError = null;

    /* ==============================
    =            HELPERS            =
    =============================== */

    /**
     * Get pending offer change.
     * @return {Promise}
     */
    function getPendingOfferChange () {
        return self.line.getOfferChange().catch(function (error) {
            Toast.error([$translate.instant("telephony_line_management_change_offer_change_error_init"), (error.data && error.data.message) || ""].join(" "));
            return $q.reject(error);
        });
    }

    /**
     * Has changed.
     * @return {Boolean}
     */
    self.hasChanged = function () {
        return !angular.equals(self.line.offerInformations.name, self.model.offer.name);
    };

    /* -----  End of HELPERS  ------ */

    /* =============================
    =            EVENTS            =
    ============================== */

    /**
     * Toggle edit mode.
     */
    self.toggleEditMode = function () {
        self.model.isEditing = !self.model.isEditing;
    };

    /**
     * Toggle edit mode.
     */
    self.toggleCancelMode = function () {
        self.model.isCanceling = !self.model.isCanceling;
    };

    /**
     * Change offer.
     * @return {Promise}
     */
    self.changeOffer = function () {
        self.loading.save = true;
        return self.line.changeOffer(self.model.offer).then(function () {
            self.toggleEditMode();
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_line_management_change_offer_change_error_save"), (error.data && error.data.message) || ""].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.save = false;
        });
    };

    /**
     * Cancel offer change.
     * @return {Promise}
     */
    self.cancelOfferChange = function () {
        self.loading.cancel = true;
        return self.line.cancelOfferChange().then(function () {
            return self.line.getCurrentOfferInformations();
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_line_management_change_offer_change_pending_cancel_error"), (error.data && error.data.message) || ""].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.cancel = false;
        });
    };

    /* -----  End of EVENTS  ------ */

    /* =====================================
    =            INITIALIZATION            =
    ====================================== */

    function init () {
        self.loading.init = true;
        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.group = group;
            self.line = self.group.getLine($stateParams.serviceName);
            return $q.all({
                currentOfferInformations: self.line.getCurrentOfferInformations(),
                pendingOfferChange: getPendingOfferChange(),
                availableOffers: self.line.getAvailableOffers()
            }).then(function (results) {
                self.availableOffers = results.availableOffers;

                // this is not sexy but we don't have information about the offer name for the moment
                self.model.offer = _.find(self.availableOffers, {
                    type: _.get(self.line, "offerInformations.type"),
                    description: _.get(self.line, "offerInformations.description")
                });
            }).catch(function (firstError) {
                Toast.error([$translate.instant("telephony_line_management_change_offer_change_error_init"), _.get(firstError, "data.message", "")].join(" "));
                self.initError = firstError;
                return $q.reject(firstError);
            });
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_line_management_change_offer_change_error_init"), _.get(error, "data.message", "")].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------ */

    init();

});
