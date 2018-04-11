angular.module("managerApp").controller("TelecomTelephonyAliasConfigurationCallsFilteringEasyHuntingCtrl", function ($stateParams, $q, $translate, OvhApiTelephony, ToastError, telephonyBulk, Toast) {
    "use strict";

    var self = this;

    self.fetchStatus = function () {
        return OvhApiTelephony.EasyHunting().ScreenListConditions().v6().get({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise;
    };

    self.fetchScreenLists = function () {
        OvhApiTelephony.EasyHunting().ScreenListConditions().Conditions().v6().resetAllCache();
        return OvhApiTelephony.EasyHunting().ScreenListConditions().Conditions().v6().query({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.then(function (ids) {
            return $q.all(_.map(_.chunk(ids, 50), function (chunkIds) {
                return OvhApiTelephony.EasyHunting().ScreenListConditions().Conditions().v6().getBatch({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName,
                    conditionId: chunkIds
                }).$promise;
            })).then(function (chunkResult) {
                var result = _.pluck(_.flatten(chunkResult), "value");
                return _.each(result, function (filter) {
                    filter.id = filter.conditionId;
                    filter.callNumber = filter.callerIdNumber;
                    filter.nature = "international";
                    filter.status = "active";
                    filter.type = filter.screenListType;
                    filter.shortType = _.startsWith(filter.screenListType, "incoming") ? "incoming" : "outgoing";
                    filter.list = filter.screenListType.indexOf("White") >= 0 ? "white" : "black";
                });
            });
        });
    };

    self.removeScreenList = function (screen) {
        return OvhApiTelephony.EasyHunting().ScreenListConditions().Conditions().v6().remove({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName,
            conditionId: screen.id
        }).$promise;
    };

    self.addScreenList = function (screen) {
        return OvhApiTelephony.EasyHunting().ScreenListConditions().Conditions().v6().create({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, {
            screenListType: screen.type.replace(/outgoing/, "destination"),
            callerIdNumber: screen.callNumber
        }).$promise;
    };

    self.onScreenListAdded = function () {
        self.screenLists.update();
    };

    self.updateScreen = function () {
        self.screenStatus.isLoading = true;
        return OvhApiTelephony.EasyHunting().ScreenListConditions().v6().change({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, {
            status: self.screenStatus.modified
        }).$promise.then(function () {
            self.screenStatus.raw = angular.copy(self.screenStatus.modified);
        }).catch(function (err) {
            self.screenStatus.modified = angular.copy(self.screenStatus.raw);
            return new ToastError(err);
        }).finally(function () {
            self.screenStatus.isLoading = false;
        });
    };

    function init () {
        self.screenLists = {
            fetchAll: self.fetchScreenLists,
            remove: self.removeScreenList,
            update: angular.noop,
            getList: function () {
                return [];
            }
        };
        self.screenStatus = {
            raw: null,
            modified: null,
            isLoading: false
        };
        self.screenStatus.isLoading = true;
        return self.fetchStatus().then(function (result) {
            self.screenStatus.raw = result.status;
            self.screenStatus.modified = angular.copy(result.status);
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.screenStatus.isLoading = false;
        });
    }

    init();

    self.bulkDatas = {
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
        infos: {
            name: "screenListConditions",
            actions: [{
                name: "screenListConditions",
                route: "/telephony/{billingAccount}/easyHunting/{serviceName}/screenListConditions",
                method: "PUT",
                params: null
            }]
        }
    };

    self.filterServices = function (services) {
        return _.filter(services, function (service) {
            return ["easyHunting", "contactCenterSolution"].indexOf(service.featureType) > -1;
        });
    };

    self.getBulkParams = function () {
        return {
            status: _.get(self, "screenStatus.modified")
        };
    };

    self.onBulkSuccess = function (bulkResult) {
        // display message of success or error
        telephonyBulk.getToastInfos(bulkResult, {
            fullSuccess: $translate.instant("telephony_line_calls_filtering_bulk_all_success"),
            partialSuccess: $translate.instant("telephony_line_calls_filtering_bulk_some_success", {
                count: bulkResult.success.length
            }),
            error: $translate.instant("telephony_line_calls_filtering_bulk_error")
        }).forEach(function (toastInfo) {
            Toast[toastInfo.type](toastInfo.message, {
                hideAfter: null
            });
        });

        window.location.reload();
    };

    self.onBulkError = function (error) {
        Toast.error([$translate.instant("telephony_line_calls_filtering_bulk_on_error"), _.get(error, "msg.data")].join(" "));
    };
});
