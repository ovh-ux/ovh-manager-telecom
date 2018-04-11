angular.module("managerApp").controller("TelecomTelephonyLineConvertCtrl", function ($q, $stateParams, $translate, OvhApiPackXdslVoipLine, OvhApiTelephony, TelephonyMediator, Toast, ToastError, telephonyBulk) {
    "use strict";

    var self = this;

    function init () {
        self.isLoading = true;
        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            return group.getLine($stateParams.serviceName);
        }).then(function (line) {
            self.line = line;
            return line.getConvertionTask().then(function (task) {
                self.task = task;
            });
        }).then(function () {
            return self.line.isIncludedInXdslPack().then(function (inPack) {
                self.isInXdslPack = inPack;
            });
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isLoading = false;
        });
    }

    self.convertToNumber = function () {
        self.isConverting = true;
        return OvhApiTelephony.Line().v6().convertToNumber({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, {}).$promise.then(function () {
            return self.line.getConvertionTask();
        }).then(function (task) {
            self.task = task;
            Toast.success($translate.instant("telephony_line_convert_convert_success"));
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isConverting = false;
        });
    };

    self.cancelConvertToNumber = function () {
        self.isCancelling = true;
        return OvhApiTelephony.Line().v6().cancelConvertToNumber({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, {}).$promise.then(function () {
            return self.line.getConvertionTask();
        }).then(function (task) {
            self.task = task;
            Toast.success($translate.instant("telephony_line_convert_cancel_success"));
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isCancelling = false;
        });
    };

    /* ===========================
    =            BULK            =
    ============================ */

    self.bulkDatas = {
        infos: {
            name: "convertToNumber",
            actions: [{
                name: "convertToNumber",
                route: "/telephony/{billingAccount}/line/{serviceName}/convertToNumber",
                method: "POST",
                params: null
            }]
        }
    };

    self.filterServices = function (services) {
        var filteredServices = _.filter(services, function (service) {
            return !_.some(service.offers, _.method("includes", "individual"));
        });

        filteredServices = _.filter(filteredServices, function (service) {
            return ["sip", "mgcp"].indexOf(service.featureType) > -1;
        });

        return OvhApiPackXdslVoipLine.v7().services().aggregate("packName").execute().$promise.then(function (lines) {
            filteredServices = _.filter(filteredServices, function (service) {
                return !_.some(lines, { key: service.serviceName });
            });

            return $q.when(filteredServices);
        });
    };

    self.getBulkParams = function () {
        return { };
    };

    self.onBulkSuccess = function (bulkResult) {
        // display message of success or error
        telephonyBulk.getToastInfos(bulkResult, {
            fullSuccess: $translate.instant("telephony_line_convert_bulk_all_success"),
            partialSuccess: $translate.instant("telephony_line_convert_bulk_some_success", {
                count: bulkResult.success.length
            }),
            error: $translate.instant("telephony_line_convert_bulk_error")
        }).forEach(function (toastInfo) {
            Toast[toastInfo.type](toastInfo.message, {
                hideAfter: null
            });
        });

        return self.line.getConvertionTask().then(function (task) {
            self.task = task;
        });
    };

    self.onBulkError = function (error) {
        Toast.error([$translate.instant("telephony_line_convert_bulk_on_error"), _.get(error, "msg.data")].join(" "));
    };

    /* -----  End of BULK  ------ */

    init();
});
