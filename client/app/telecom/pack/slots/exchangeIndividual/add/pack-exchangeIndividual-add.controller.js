angular.module("managerApp").controller("PackExchangeIndividualEmailAddCtrl", function ($q, $scope, $stateParams, OvhApiPackXdslExchangeIndividual, Toast, $translate) {
    "use strict";

    var self = this;

    this.add = function () {
        this.pendingOrder = true;

        Toast.info($translate.instant("in_validation"));

        var accountTmp = angular.copy(self.account);
        delete accountTmp.name;
        delete accountTmp.domain;
        delete accountTmp.passwordConfirmation;

        accountTmp.email = self.account.name + self.account.domain;

        return OvhApiPackXdslExchangeIndividual.v6().save(
            {
                packId: $stateParams.packName
            },
            accountTmp).$promise.then(function (data) {
                Toast.success($translate.instant("success_validation"));
                return data;
            }).catch(function (error) {
                Toast.error([$translate.instant("an_error_ocurred"), _.get(error, "data.message", "")].join(" "));
                return $q.reject(error);
            }).finally(function () {
                self.pendingOrder = true;
            });
    };

    this.init = function () {
        $scope.domains = [];

        OvhApiPackXdslExchangeIndividual.v6().getDomains({ packId: $stateParams.packName }, function (domains) {
            _.each(domains, function (domain) {
                $scope.domains.push("@" + domain);
            });
        });

        $scope.$watchGroup(["ctrl.account.name", "ctrl.account.domain"], function (newValue) {
            if (newValue[0] && newValue[1]) {
                var validAddress = validator.isEmail(newValue[0] + newValue[1]);

                if (!validAddress) {
                    $scope.accountForm.accountName.$error.invalidAddress = true;
                } else {
                    delete $scope.accountForm.accountName.$error.invalidAddress;
                }

                $scope.accountForm.accountName.$validate();
            }
        });

        self.availablesDomains = [
            {
                value: "@ovh.fr",
                label: "ovh.fr"
            }
        ];

    };

    this.init();
});
