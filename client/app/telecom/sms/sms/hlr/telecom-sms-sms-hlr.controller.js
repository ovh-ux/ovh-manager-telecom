angular.module("managerApp").controller("TelecomSmsSmsHlrCtrl", function ($stateParams, $q, $translate, Sms, SmsMediator, validator, Toast, ToastError, SMS_URL) {
    "use strict";

    var self = this;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function fetchOperator (hlr) {
        return Sms.Hlr().Lexi().getOperator({
            serviceName: $stateParams.serviceName,
            id: hlr.id
        }).$promise;
    }

    /** @TODO removed when api returns the Terms Of Use (CGU) **/
    self.getHlrTermsOfUse = function () {
        return SMS_URL.hlrTermsOfUse;
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.refresh = function () {
        self.hlr.raw = null;
        Sms.Hlr().Lexi().resetCache();
        Sms.Hlr().Lexi().resetQueryCache();
        return Sms.Hlr().Lexi().query({
            serviceName: $stateParams.serviceName
        }).$promise.then(function (hlr) {
            self.hlr.raw = hlr;
        });
    };

    self.getDetails = function (item) {
        self.hlr.isLoading = true;
        return Sms.Hlr().Lexi().get({
            serviceName: $stateParams.serviceName,
            id: item
        }).$promise.then(function (hlr) {
            return fetchOperator(hlr).then(function (operator) {
                return _.assign(hlr, { operatorName: operator.operator });
            }, function () {
                return hlr;
            });
        });
    };

    self.onTransformItemDone = function () {
        self.hlr.isLoading = false;
    };

    self.orderBy = function (by) {
        if (self.hlr.orderBy === by) {
            self.hlr.orderDesc = !self.hlr.orderDesc;
        } else {
            self.hlr.orderBy = by;
        }
    };

    self.send = function () {
        self.hlr.isSending = true;

        return Sms.Hlr().Lexi().send({
            serviceName: $stateParams.serviceName
        }, {
            receivers: [self.receiver]
        }).$promise.then(function () {
            self.service.creditsLeft -= 0.1;
            return Sms.Hlr().Lexi().query({
                serviceName: $stateParams.serviceName
            }).$promise.then(function (hlr) {
                self.hlr.raw = hlr;
                Toast.success($translate.instant("sms_sms_hlr_query_send_success"));
            });
        }, function () {
            Toast.error($translate.instant("sms_sms_hlr_query_send_failed"));
        }).finally(function () {
            self.hlr.isSending = false;
            self.refresh();
        });
    };

    self.formatReceiverNumber = function (number) {
        if (number) {
            if (_.startsWith(number, "00")) {
                return "+" + _.trimLeft(number, "00");
            } else if (number.charAt(0) === "0") {
                return "+33" + number.slice(1);
            }
        }
        return number;
    };

    self.computeReceiver = function () {
        self.receiver = self.formatReceiverNumber(self.receiver);
    };

    self.restrictInput = function () {
        if (self.receiver) {
            self.receiver = self.receiver.replace(/[^0-9\+]/g, "");
        }
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.hlr = {
            raw: null,
            paginated: null,
            isLoading: false,
            isSending: false,
            orderBy: "datetime",
            orderDesc: true
        };

        self.service = null;

        self.hlr.isLoading = true;

        return SmsMediator.initDeferred.promise.then(function () {
            return Sms.Hlr().Lexi().query({
                serviceName: $stateParams.serviceName
            }).$promise.then(function (hlr) {
                self.hlr.raw = hlr;
                self.service = SmsMediator.getCurrentSmsService();
            });
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.hlr.isLoading = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
