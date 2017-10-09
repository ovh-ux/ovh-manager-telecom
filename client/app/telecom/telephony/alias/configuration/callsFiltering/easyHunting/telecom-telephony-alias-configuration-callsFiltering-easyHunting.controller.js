angular.module("managerApp").controller("TelecomTelephonyAliasConfigurationCallsFilteringEasyHuntingCtrl", function ($stateParams, $q, OvhApiTelephony, ToastError) {
    "use strict";

    var self = this;

    self.fetchStatus = function () {
        return OvhApiTelephony.EasyHunting().ScreenListConditions().Lexi().get({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise;
    };

    self.fetchScreenLists = function () {
        OvhApiTelephony.EasyHunting().ScreenListConditions().Conditions().Lexi().resetAllCache();
        return OvhApiTelephony.EasyHunting().ScreenListConditions().Conditions().Lexi().query({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.then(function (ids) {
            return $q.all(_.map(_.chunk(ids, 50), function (chunkIds) {
                return OvhApiTelephony.EasyHunting().ScreenListConditions().Conditions().Lexi().getBatch({
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
        return OvhApiTelephony.EasyHunting().ScreenListConditions().Conditions().Lexi().remove({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName,
            conditionId: screen.id
        }).$promise;
    };

    self.addScreenList = function (screen) {
        return OvhApiTelephony.EasyHunting().ScreenListConditions().Conditions().Lexi().create({
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
        return OvhApiTelephony.EasyHunting().ScreenListConditions().Lexi().change({
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
});
