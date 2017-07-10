angular.module("managerApp").controller("TelecomTelephonyLineCallsFilteringCtrl", function ($stateParams, $q, $timeout, Toast, ToastError, Telephony) {
    "use strict";

    var self = this;

    self.fetchScreenLists = function () {
        Telephony.Screen().ScreenLists().Lexi().resetAllCache();
        return Telephony.Screen().ScreenLists().Lexi().query({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.then(function (ids) {
            return $q.all(_.map(_.chunk(ids, 50), function (chunkIds) {
                return Telephony.Screen().ScreenLists().Lexi().getBatch({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName,
                    id: chunkIds
                }).$promise;
            })).then(function (chunkResult) {
                var result = _.pluck(_.flatten(chunkResult), "value");
                return _.each(result, function (filter) {
                    filter.shortType = _.startsWith(filter.type, "incoming") ? "incoming" : "outgoing";
                    filter.list = filter.type.indexOf("White") >= 0 ? "white" : "black";
                });
            });
        });
    };

    self.addScreenList = function (screen) {
        return Telephony.Screen().ScreenLists().Lexi().create({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, screen).$promise;
    };

    self.onScreenListAdded = function () {
        self.screenLists.update();
    };

    self.removeScreenList = function (screen) {
        return Telephony.Screen().ScreenLists().Lexi().remove({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName,
            id: screen.id
        }).$promise;
    };

    self.fetchScreen = function () {
        return Telephony.Screen().Lexi().get({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise;
    };

    self.fetchOptions = function () {
        return Telephony.Line().Lexi().getOptions({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise;
    };

    function init () {
        self.screen = {
            raw: [],
            modified: null,
            isLoading: false,
            isIncomingLoading: false,
            isOutgoingLoading: false
        };
        self.screenLists = {
            fetchAll: self.fetchScreenLists,
            remove: self.removeScreenList,
            update: angular.noop,
            getList: function () {
                return [];
            }
        };
        self.options = {
            raw: null,
            modified: null,
            isUpdating: null
        };
        self.serviceName = $stateParams.serviceName;
        self.isInitializing = true;
        return self.refresh().catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isInitializing = false;
        });
    }

    self.updateScreen = function (type) {
        self.screen.isLoading = true;
        if (type === "incoming") {
            self.screen.isIncomingLoading = true;
        } else {
            self.screen.isOutgoingLoading = true;
        }
        return Telephony.Screen().Lexi().change({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, {
            outgoingScreenList: self.screen.modified.outgoingScreenList,
            incomingScreenList: self.screen.modified.incomingScreenList
        }).$promise.then(function () {
            self.screen.raw = angular.copy(self.screen.modified);
        }).catch(function (err) {
            self.screen.modified = angular.copy(self.screen.raw);
            return new ToastError(err);
        }).finally(function () {
            self.screen.isLoading = false;
            self.screen.isIncomingLoading = false;
            self.screen.isOutgoingLoading = false;
        });
    };

    self.changeOption = function (opt) {
        self.options.isUpdating = {};
        self.options.isUpdating[opt] = true;
        return Telephony.Line().Lexi().setOptions({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, _.pick(self.options.modified, opt)).$promise.then(function () {
            _.assign(self.options.raw, _.pick(self.options.modified, opt));
        }).then(function () {
            return $timeout(angular.noop, 500); // avoid clipping
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.options.isUpdating = null;
        });
    };

    self.refresh = function () {
        self.isLoading = true;
        return $q.all({
            screen: self.fetchScreen(),
            options: self.fetchOptions()
        }).then(function (result) {
            self.screen.raw = result.screen;
            self.screen.modified = angular.copy(self.screen.raw);
            self.options.raw = result.options;
            self.options.modified = angular.copy(result.options);
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isLoading = false;
        });
    };

    init();
});
