angular.module("managerApp").controller("TelecomTelephonyLineCtrl", function ($q, $stateParams, $translate, TelephonyMediator, SidebarMenu, Toast) {
    "use strict";

    var self = this;

    self.loading = {
        init: false,
        save: false
    };

    self.line = null;
    self.fax = null;
    self.links = null;

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.lineNameSave = function (newServiceDescription) {
        self.line.startEdition();
        self.line.description = newServiceDescription;
        return self.line.save().then(function () {
            self.line.stopEdition();
            SidebarMenu.updateItemDisplay({
                title: self.line.getDisplayedName()
            }, self.line.serviceName, "telecom-telephony-section", self.line.billingAccount);
        }, function (error) {
            self.line.stopEdition(true);
            Toast.error([$translate.instant("telephony_line_rename_error", $stateParams), error.data.message].join(" "));
            return $q.reject(error);
        });
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.init = true;

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {

            var promises = [];
            self.line = group.getLine($stateParams.serviceName);
            self.fax = _.find(group.fax, { serviceName: $stateParams.serviceName });

            // check if line is terminating
            promises.push(self.line.getTerminating().then(function (terminating) {
                self.terminating = terminating;
            }));

            // check if line is converting to alias
            promises.push(self.line.getConvertionTask().then(function (task) {
                self.converting = task;
            }));

            self.links = {
                contactDetails: TelephonyMediator.getV6ToV4RedirectionUrl("line.line_manage_directory")
            };

            return $q.all(promises);
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

});
