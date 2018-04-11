angular.module("managerApp").controller("TelecomTelephonyBillingAccountCtrl", function ($q, $translate, $stateParams, TelephonyMediator, SidebarMenu, Toast, OvhApiOrder, OvhApiTelephony) {
    "use strict";

    var self = this;

    self.loading = {
        init: false,
        save: false
    };

    self.group = null;
    self.links = null;
    self.terminationTask = null;

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.groupNameSave = function (newServiceName) {
        self.group.startEdition();
        self.group.description = newServiceName;
        return self.group.save().then(function () {
            self.group.stopEdition();
            SidebarMenu.updateItemDisplay({
                title: self.group.getDisplayedName()
            }, self.group.billingAccount, "telecom-telephony-section");
        }, function (error) {
            self.group.stopEdition(true);
            Toast.error([$translate.instant("telephony_group_rename_error", $stateParams), error.data.message].join(" "));
            return $q.reject(error);
        });
    };

    /* -----  End of ACTIONS  ------*/

    function fetchGroupTerminationTask (group) {
        return OvhApiTelephony.OfferTask().v6().query({
            billingAccount: group.billingAccount
        }).$promise.then(function (offerTaskIds) {
            return $q.all(_.map(offerTaskIds, function (id) {
                return OvhApiTelephony.OfferTask().v6().get({
                    billingAccount: group.billingAccount,
                    taskId: id
                }).$promise;
            })).then(function (tasks) {
                self.terminationTask = _.head(_.filter(tasks, { action: "termination", status: "todo", type: "offer" }));
            });
        });
    }

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.init = true;

        $q.all([
            TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
                self.group = group;

                self.links = {
                    contactList: TelephonyMediator.getV6ToV4RedirectionUrl("group.group_manage_phonebook"),
                    shortNumbers: TelephonyMediator.getV6ToV4RedirectionUrl("group.group_abreviated_numbers"),
                    contactManagement: TelephonyMediator.getV6ToV4RedirectionUrl("group.group_nics_management")
                };
                return fetchGroupTerminationTask(group);
            }, function (error) {
                Toast.error([$translate.instant("telephony_group_loading_error", $stateParams), error.data.message].join(" "));
                return $q.reject(error);
            }),
            OvhApiOrder.Telephony().v6().billingAccounts().$promise.then(
                function (allowedBillingAccounts) {
                    self.canOrderAlias = allowedBillingAccounts.indexOf($stateParams.billingAccount) > -1;
                    return self.canOrderAlias;
                }
            )
        ]).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

});
