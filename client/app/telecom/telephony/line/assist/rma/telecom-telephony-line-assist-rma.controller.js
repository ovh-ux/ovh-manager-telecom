angular.module("managerApp").controller("TelecomTelephonyLineAssistRmaCtrl", function ($stateParams, $q, $translate, Toast, ToastError, Telephony) {
    "use strict";

    var self = this;

    function init () {
        self.rmaList = null;
        return self.fetchRma().then(function (result) {
            self.rmaList = result;
        }).catch(function (err) {
            return new ToastError(err);
        });
    }

    self.fetchPhone = function () {
        return Telephony.Line().Phone().Lexi().get({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise;
    };

    self.fetchRma = function () {
        return Telephony.Line().Phone().RMA().Lexi().query({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.catch(function (err) {
            if (err.status === 404) { // line has no phone
                return [];
            }
            return $q.reject(err);

        }).then(function (rmaIds) {
            return $q.all(rmaIds.map(function (id) {
                return Telephony.Line().Phone().RMA().Lexi().get({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName,
                    id: id
                }).$promise;
            }));
        });
    };

    self.cancelRma = function (rma) {
        rma.isCancelling = true;
        return Telephony.Line().Phone().RMA().Lexi().cancel({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName,
            id: rma.id
        }).$promise.then(function () {
            _.remove(self.rmaList, { id: rma.id });
            Toast.success($translate.instant("telephony_line_assist_rma_cancel_success"));
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            rma.isCancelling = false;
        });
    };

    self.formatEquipementReference = function (ref) {
        // example : 'AB12345' => 'AB:12:34:5'
        return ((ref || "").match(/\w{1,2}/g) || []).join(":");
    };

    self.getPdfUrl = function (rma) {
        return "http://www.ovh.com/cgi-bin/telephony/rma.pl?reference=" + rma.id;
    };

    init();
});
