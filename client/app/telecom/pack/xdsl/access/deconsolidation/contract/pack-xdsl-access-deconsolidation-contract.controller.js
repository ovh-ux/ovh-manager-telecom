angular.module("managerApp").controller("XdslDeconsolidationContractCtrl", function ($uibModalInstance, data, ToastError, URLS, OvhApiXdslDeconsolidation, OvhApiMeVipStatus, $q) {
    "use strict";

    var self = this;

    this.rio = data.rio;
    this.loading = false;
    this.serviceName = data.serviceName;

    this.checkboxSelected1 = false;
    this.checkboxSelected2 = false;
    this.checkboxSelected3 = false;

    this.terms = null;
    this.packAdslPro2013 = URLS.generalConditions.packAdslPro2013;
    this.packAdslEnterprise2013 = URLS.generalConditions.packAdslEnterprise2013;

    this.cancel = function () {
        $uibModalInstance.dismiss("cancel");
    };

    function getTerms () {
        return OvhApiXdslDeconsolidation.v6().terms({
            serviceName: self.serviceName
        }).$promise.then(
            function (terms) {
                self.terms = terms;
            },
            ToastError)
            .finally(function () {
                self.loading = false;
            });
    }

    function getIsVIP () {
        return OvhApiMeVipStatus.v6().get().$promise.then(
            function (vipStatus) {
                self.isVIP = vipStatus.telecom;
            },
            function (err) {
                return new ToastError(err);
            }
        );
    }

    this.confirm = function () {
        self.loading = true;
        OvhApiXdslDeconsolidation.v6().requestTotalDeconsolidation({
            serviceName: self.serviceName
        }, self.rio ? { rio: self.rio } : null).$promise.then(function (result) {
            $uibModalInstance.close(result);
        }, ToastError).finally(function () {
            self.loading = false;
        });
    };

    function init () {
        self.loading = true;

        $q.all([getTerms(), getIsVIP()]).finally(function () {
            self.loading = false;
        });
    }

    init();
});
