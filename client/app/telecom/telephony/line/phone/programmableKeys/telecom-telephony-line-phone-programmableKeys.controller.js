angular.module("managerApp").controller("TelecomTelephonyLinePhoneProgammableKeysCtrl", function ($translate, TelephonyMediator, $stateParams, $uibModal, Toast) {
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

    init();
}
);
