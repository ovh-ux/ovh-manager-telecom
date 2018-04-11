angular.module("managerApp").controller("TelecomTelephonyLineCallsCallWaitingCtrl", function ($q, $stateParams, $translate, Toast, ToastError, OvhApiTelephony, TelephonyMediator, telephonyBulk) {
    "use strict";

    var self = this;

    function setIntercomGetter (obj) {
        Object.defineProperty(obj, "intercom", {
            get: function () {
                return this.intercomSwitch ? "prefixed" : "no";
            }
        });
    }

    this.needSave = function () {
        return (this.options.callWaiting !== self.saved.callWaiting) ||
                   (this.options.intercom !== self.saved.intercom);
    };

    this.cancel = function () {
        this.options = angular.copy(this.saved);
        setIntercomGetter(this.options);
    };

    this.save = function () {
        var data = {
            intercom: this.options.intercom
        };

        if (self.phone && self.phone.protocol === "mgcp") {
            data.callWaiting = this.options.callWaiting;
        } else {
            data.callWaiting = false;
        }

        self.loading.save = true;

        OvhApiTelephony.Line().Options().v6().update({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, data).$promise.then(function () {
            self.saved = angular.copy(self.options);
            if (self.phone && self.phone.protocol === "mgcp") {
                Toast.success($translate.instant("telephony_line_actions_line_calls_call_waiting_cw_save_success_" + self.options.callWaiting));
            }
            Toast.success($translate.instant("telephony_line_actions_line_calls_call_waiting_intercom_save_success_" + self.options.intercom));
        }, function () {
            ToastError($translate.instant("telephony_line_actions_line_calls_call_waiting_save_error"));
        }).finally(function () {
            self.loading.save = false;
        });
    };

    function init () {
        self.loading = {
            init: true
        };

        self.options = {
            callWaiting: null,
            intercomSwitch: null
        };

        self.phone = null;

        self.saved = angular.copy(self.options);

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            return group.getLine($stateParams.serviceName);
        }).then(function (line) {
            return line.getPhone().then(function (phone) {
                self.phone = phone;
                return phone;
            });
        }).then(function () {
            return OvhApiTelephony.Line().Options().v6().get({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName
            }).$promise;
        }).then(function (options) {
            self.options = _.pick(options, ["callWaiting", "intercom"]);
            self.options.intercomSwitch = (self.options.intercom !== "no");

            setIntercomGetter(self.options);

            self.saved = angular.copy(self.options);

            return self.options;
        }).catch(function () {
            ToastError($translate.instant("telephony_line_actions_line_calls_call_waiting_load_error"));
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* ===========================
    =            BULK            =
    ============================ */

    self.bulkDatas = {
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
        infos: {
            name: "callWaiting",
            actions: [{
                name: "options",
                route: "/telephony/{billingAccount}/line/{serviceName}/options",
                method: "PUT",
                params: null
            }]
        }
    };

    self.filterServices = function (services) {
        return _.filter(services, function (service) {
            return ["sip", "mgcp"].indexOf(service.featureType) > -1;
        });
    };

    self.getBulkParams = function () {
        var data = {
            callWaiting: self.options.callWaiting,
            intercom: self.options.intercom
        };

        return data;
    };

    self.onBulkSuccess = function (bulkResult) {
        // display message of success or error
        telephonyBulk.getToastInfos(bulkResult, {
            fullSuccess: $translate.instant("telephony_line_actions_line_calls_cw_intercom_bulk_all_success"),
            partialSuccess: $translate.instant("telephony_line_actions_line_calls_cw_intercom_bulk_some_success", {
                count: bulkResult.success.length
            }),
            error: $translate.instant("telephony_line_actions_line_calls_cw_intercom_bulk_error")
        }).forEach(function (toastInfo) {
            Toast[toastInfo.type](toastInfo.message, {
                hideAfter: null
            });
        });

        // reset initial values to be able to modify again the options
        OvhApiTelephony.Line().Options().resetCache();
        init();
    };

    self.onBulkError = function (error) {
        Toast.error([$translate.instant("telephony_line_actions_line_calls_cw_intercom_bulk_on_error"), _.get(error, "msg.data")].join(" "));
    };

    /* -----  End of BULK  ------ */

    init();
});
