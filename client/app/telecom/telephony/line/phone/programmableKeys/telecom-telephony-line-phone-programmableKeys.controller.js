angular.module("managerApp").controller("TelecomTelephonyLinePhoneProgammableKeysCtrl", function ($q, $translate, TelephonyMediator, $stateParams, $uibModal, Toast, OvhApiTelephony, telephonyBulk, voipLinePhoneFunction) {
    "use strict";

    var self = this;

    self.loading = {
        init: false,
        keys: false
    };
    self.hasPhone = false;
    self.order = {
        by: "keyNum",
        desc: false
    };

    self.functionKeys = {
        raw: null,
        paginated: null
    };

    self.orderBy = function (by) {
        if (self.order.by === by) {
            self.order.desc = !self.order.desc;
        } else {
            self.order.by = by;
        }
    };

    self.edit = function (functionKey) {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/telephony/line/phone/programmableKeys/edit/telecom-telephony-line-phone-programmableKeys-edit.html",
            controller: "TelecomTelephonyLinePhoneProgammableKeysEditCtrl",
            controllerAs: "ProgammableKeysEditCtrl",
            resolve: {
                functionKey: function () { return functionKey; }
            }
        });

        modal.result.then(function () {
            return self.getPhone();
        }, function (error) {
            if (error && error.type === "API") {
                Toast.error($translate.instant("telephony_line_phone_programmableKeys_save_error", { error: error.msg }));
            }
            return self.getPhone();
        });

        return modal;
    };

    /*= =====================================
        =            INITIALIZATION            =
        ======================================*/

    function init () {
        self.loading.init = true;
        self.hasPhone = false;

        TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {

            self.group = group;
            self.line = self.group.getLine($stateParams.serviceName);

            return self.getPhone();

        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    this.getPhone = function () {
        return self.line.getPhone().then(function () {
            if (self.line.hasPhone) {
                return self.line.phone.initDeffered().then(function () {
                    self.functionKeys.raw = angular.copy(self.line.phone.functionKeys);
                });
            }
            return null;

        });
    };

    /* ===========================
    =            BULK            =
    ============================ */

    self.bulkDatas = {
        infos: {
            name: "functionKeys",
            actions: [{
                name: ""
            }]
        }
    };

    self.getBulkParams = function () {
        self.bulkDatas.infos.actions = self.buildBulkActions();
    };

    self.buildBulkActions = function () {
        return _.map(self.functionKeys.raw, function (key) {
            return {
                name: "functionKey",
                route: `/telephony/{billingAccount}/line/{serviceName}/phone/functionKey/${key.keyNum}`,
                method: "PUT",
                params: {
                    "function": key.function,
                    parameter: key.parameter
                }
            };
        });
    };

    self.filterServices = function (services) {
        var filteredServices = _.filter(services, function (service) {
            return ["sip", "mgcp"].indexOf(service.featureType) > -1;
        });

        return voipLinePhoneFunction.fetchAll().then(function (voipLinePhoneFunctions) {
            return $q.when(_.filter(filteredServices, function (service) {
                return _.find(voipLinePhoneFunctions, { serviceName: service.serviceName, billingAccount: service.billingAccount });
            }));
        });
    };

    self.onBulkSuccess = function (bulkResult) {
        if (bulkResult.error.length) {
            bulkResult.error = _.map(bulkResult.error, function (error) {
                let errorDetails = _.get(error, "errors[0]");
                _.set(error, "errors[0].error", errorDetails.statusCode === 501 ?
                    $translate.instant("telephony_line_phone_programmableKeys_bulk_error_details") : errorDetails.error);

                return error;
            });
        }

        // display message of success or error
        telephonyBulk.getToastInfos(bulkResult, {
            fullSuccess: $translate.instant("telephony_line_phone_programmableKeys_bulk_all_success"),
            partialSuccess: $translate.instant("telephony_line_phone_programmableKeys_bulk_some_success", {
                count: bulkResult.success.length
            }),
            error: $translate.instant("telephony_line_phone_programmableKeys_bulk_error")
        }, true).forEach(function (toastInfo) {
            Toast[toastInfo.type](toastInfo.message, {
                hideAfter: null
            });
        });

        // reset initial values to be able to modify again the options
        TelephonyMediator.resetAllCache();
        init();
    };

    self.onBulkError = function (error) {
        Toast.error([$translate.instant("telephony_line_phone_programmableKeys_bulk_on_error"), _.get(error, "msg.data")].join(" "));
    };

    /* -----  End of BULK  ------ */

    init();
}
);
