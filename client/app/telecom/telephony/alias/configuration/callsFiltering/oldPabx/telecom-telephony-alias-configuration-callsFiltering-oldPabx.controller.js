angular.module("managerApp").controller("TelecomTelephonyAliasConfigurationCallsFilteringOldPabxCtrl", function ($stateParams, $q, OvhApiTelephony, ToastError) {
    "use strict";

    var self = this;

    self.fetchStatus = function () {
        return OvhApiTelephony.Screen().Lexi().get({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise;
    };

    self.fetchScreenLists = function () {
        OvhApiTelephony.Screen().ScreenLists().Lexi().resetAllCache();
        return OvhApiTelephony.Screen().ScreenLists().Lexi().query({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.then(function (ids) {
            return $q.all(_.map(_.chunk(ids, 50), function (chunkIds) {
                return OvhApiTelephony.Screen().ScreenLists().Lexi().getBatch({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName,
                    id: chunkIds
                }).$promise;
            })).then(function (chunkResult) {
                var result = _.pluck(_.flatten(chunkResult), "value");
                return _.map(result, function (res) {
                    return angular.extend(res, {
                        shortType: _.startsWith(res.type, "incoming") ? "incoming" : "outgoing",
                        list: res.type.indexOf("White") >= 0 ? "white" : "black"
                    });
                });
            });
        });
    };

    self.removeScreenList = function (screen) {
        return OvhApiTelephony.Screen().ScreenLists().Lexi().remove({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName,
            id: screen.id
        }).$promise;
    };

    self.addScreenList = function (screen) {
        return OvhApiTelephony.Screen().ScreenLists().Lexi().create({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, {
            type: screen.type,
            callNumber: screen.callNumber,
            nature: screen.nature
        }).$promise;
    };

    self.onScreenListAdded = function () {
        self.screenLists.update();
    };

    self.updateScreen = function () {
        self.screenStatus.isLoading = true;
        return OvhApiTelephony.Screen().Lexi().change({
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
            self.screenStatus.raw = result.incomingScreenList;
            self.screenStatus.modified = angular.copy(result.incomingScreenList);
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.screenStatus.isLoading = false;
        });
    }

    init();
});
