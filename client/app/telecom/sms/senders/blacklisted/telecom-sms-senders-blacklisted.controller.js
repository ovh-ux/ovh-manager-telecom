angular.module("managerApp").controller("TelecomSmsSendersBlacklistedCtrl", function ($stateParams, $q, $filter, $timeout, $uibModal, $translate, Sms, Toast, ToastError) {
    "use strict";

    var self = this;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function fetchBlacklists () {
        return Sms.Blacklists().Lexi().query({
            serviceName: $stateParams.serviceName
        }).$promise.then(function (blacklistsIds) {
            return $q.all(_.map(blacklistsIds, function (number) {
                return Sms.Blacklists().Lexi().get({
                    serviceName: $stateParams.serviceName,
                    number: number
                }).$promise;
            }));
        });
    }

    self.getSelection = function () {
        return _.filter(self.blacklists.raw, function (list) {
            return list && self.blacklists.selected && self.blacklists.selected[list.number];
        });
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.refresh = function () {
        Sms.Blacklists().Lexi().resetAllCache();
        self.blacklists.isLoading = true;
        return fetchBlacklists().then(function (blacklists) {
            self.blacklists.raw = angular.copy(blacklists);
            self.applySorting();
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.blacklists.isLoading = false;
        });
    };

    self.applySorting = function () {
        var data = angular.copy(self.blacklists.raw);
        data = $filter("orderBy")(
            data,
            self.blacklists.orderBy,
            self.blacklists.orderDesc
        );
        self.blacklists.sorted = data;
    };

    self.orderBy = function (by) {
        if (self.blacklists.orderBy === by) {
            self.blacklists.orderDesc = !self.blacklists.orderDesc;
        } else {
            self.blacklists.orderBy = by;
        }
        self.applySorting();
    };

    self.deleteSelectedBlacklist = function () {
        var blackLists = self.getSelection();
        var queries = blackLists.map(function (list) {
            return Sms.Blacklists().Lexi().delete({
                serviceName: $stateParams.serviceName,
                number: list.number
            }).$promise;
        });
        self.blacklists.isDeleting = true;
        queries.push($timeout(angular.noop, 500)); // avoid clipping
        Toast.info($translate.instant("sms_senders_blacklisted_delete_list_success"));
        return $q.all(queries).then(function () {
            self.blacklists.selected = {};
            return self.refresh();
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.blacklists.isDeleting = false;
        });
    };

    self.remove = function (blacklist) {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/senders/blacklisted/remove/telecom-sms-senders-blacklisted-remove.html",
            controller: "TelecomSmsSendersBlacklistedRemoveCtrl",
            controllerAs: "SendersBlacklistedRemoveCtrl",
            resolve: {
                blacklist: function () { return blacklist; }
            }
        });

        modal.result.then(function () {
            return self.refresh();
        }, function (error) {
            if (error && error.type === "API") {
                Toast.error($translate.instant("sms_senders_blacklisted_sender_ko", { error: _.get(error, "msg.data.message") }));
            }
        });

        return modal;
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.blacklists = {
            raw: [],
            paginated: null,
            sorted: null,
            selected: {},
            orderBy: "number",
            orderDesc: false,
            isLoading: false,
            isDeleting: false
        };

        self.refresh();
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
