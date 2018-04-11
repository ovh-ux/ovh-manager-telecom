angular.module("managerApp").controller("TelecomTelephonyLineRestrictionsCtrl", function ($stateParams, $timeout, $q, $document, $translate, OvhApiTelephony, ToastError, IpAddress, OvhApiMe, Toast, telephonyBulk) {
    "use strict";

    var self = this;

    function fetchLineOptions () {
        return OvhApiTelephony.Line().v6().getOptions({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise;
    }

    function fetchAccountRestrictions () {
        return OvhApiMe.Telephony().DefaultIpRestriction().v6().query().$promise.then(function (ids) {
            return $q.all(ids.map(function (id) {
                return OvhApiMe.Telephony().DefaultIpRestriction().v6().get({
                    id: id
                }).$promise;
            }));
        }).then(function (ips) {
            return _.sortBy(ips, "id");
        });
    }

    function init () {
        self.isLoading = true;
        return $q.all({
            options: fetchLineOptions(),
            accountRestrictions: fetchAccountRestrictions()
        }).then(function (result) {
            self.lineOptions = result.options;
            self.lineOptionsForm = angular.copy(self.lineOptions);
            self.accountRestrictions = result.accountRestrictions;
            self.accountRestrictionsForm = angular.copy(self.accountRestrictions);
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isLoading = false;
        });
    }

    self.addLineRestriction = function () {
        if (self.lineOptionsForm.ipRestrictions.length < 6) {
            self.lineOptionsForm.ipRestrictions.push("");
            $timeout(function () {
                var input = $document.find("input.lineIpInput:last");
                if (input) {
                    input.focus();
                }
            });
        }
    };

    self.addAccountRestriction = function () {
        if (self.accountRestrictionsForm.length < 6) {
            self.accountRestrictionsForm.push({
                subnet: ""
            });
            $timeout(function () {
                var input = $document.find("input.accountIpInput:last");
                if (input) {
                    input.focus();
                }
            });
        }
    };

    self.hasLineRestrictionChanged = function () {
        return !angular.equals(self.lineOptionsForm.ipRestrictions, self.lineOptions.ipRestrictions);
    };

    self.hasAccountRestrictionChanged = function () {
        return !angular.equals(self.accountRestrictions, self.accountRestrictionsForm);
    };

    self.cancelLineChanges = function () {
        self.lineOptionsForm.ipRestrictions = angular.copy(self.lineOptions.ipRestrictions);
    };

    self.cancelAccountChanges = function () {
        self.accountRestrictionsForm = angular.copy(self.accountRestrictions);
    };

    self.applyLineChanges = function () {
        var options = angular.copy(self.lineOptions);
        options.ipRestrictions = self.lineOptionsForm.ipRestrictions;
        self.isChangingLineOptions = true;
        return OvhApiTelephony.Line().v6().setOptions({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, options).$promise.then(function () {
            return fetchLineOptions().then(function (result) {
                self.lineOptions = result;
                self.lineOptionsForm = angular.copy(self.lineOptions);
            });
        }).then(function () {
            self.changeLineSuccess = true;
            $timeout(function () {
                self.changeLineSuccess = false;
            }, 2000);
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isChangingLineOptions = false;
        });
    };

    self.applyAccountChanges = function () {
        var changes = _.filter(self.accountRestrictionsForm, function (ip) {
            var changed = false;
            if (ip.id) {
                var oldIp = _.find(self.accountRestrictions, { id: ip.id });
                if (oldIp.subnet !== ip.subnet) {
                    changed = true;
                }
            }
            return changed;
        });
        var toAdd = _.filter(self.accountRestrictionsForm, function (ip) {
            return !ip.id;
        });
        var toDelete = _.filter(self.accountRestrictions, function (ip) {
            return ip.id && !_.find(self.accountRestrictionsForm, { id: ip.id });
        });
        var deletePromise = _.pluck(changes.concat(toDelete), "id").map(function (id) {
            return OvhApiMe.Telephony().DefaultIpRestriction().v6().remove({
                id: id
            }).$promise;
        });
        var addPromise = _.pluck(changes.concat(toAdd), "subnet").map(function (ip) {
            var subnet = ("" || ip).indexOf("/") >= 0 ? ip : ip + "/32";
            return OvhApiMe.Telephony().DefaultIpRestriction().v6().create({
                subnet: subnet,
                type: "sip"
            }).$promise;
        });
        self.isChangingAccountOptions = true;
        return $q.all(deletePromise).then(function () {
            return $q.all(addPromise);
        }).then(function () {
            return fetchAccountRestrictions().then(function (result) {
                self.accountRestrictions = result;
                self.accountRestrictionsForm = angular.copy(self.accountRestrictions);
            });
        }).then(function () {
            self.changeAccountSuccess = true;
            $timeout(function () {
                self.changeAccountSuccess = false;
            }, 2000);
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isChangingAccountOptions = false;
        });
    };

    self.ipValidator = (function () {
        return {
            test: function (value) {
                return IpAddress.isValidPublicIp4(value);
            }
        };
    })();

    /* ===========================
    =            BULK            =
    ============================ */

    self.bulkDatas = {
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
        infos: {
            name: "ipRestrictions",
            actions: [{
                name: "options",
                route: "/telephony/{billingAccount}/line/{serviceName}/options",
                method: "PUT",
                params: null
            }]
        }
    };

    self.filterServices = function (services) {
        return _.filter(services, function (service) {
            return ["sip"].indexOf(service.featureType) > -1;
        });
    };

    self.getBulkParams = function () {
        return {
            ipRestrictions: self.lineOptionsForm.ipRestrictions
        };
    };

    self.onBulkSuccess = function (bulkResult) {
        // display message of success or error
        telephonyBulk.getToastInfos(bulkResult, {
            fullSuccess: $translate.instant("telephony_line_restrictions_ip_bulk_all_success"),
            partialSuccess: $translate.instant("telephony_line_restrictions_ip_bulk_some_success", {
                count: bulkResult.success.length
            }),
            error: $translate.instant("telephony_line_restrictions_ip_bulk_error")
        }).forEach(function (toastInfo) {
            Toast[toastInfo.type](toastInfo.message, {
                hideAfter: null
            });
        });
        self.applyLineChanges();

        // reset initial values to be able to modify again the options
        OvhApiTelephony.Line().v6().resetAllCache();
        init();
    };

    self.onBulkError = function (error) {
        Toast.error([$translate.instant("telephony_line_restrictions_ip_bulk_on_error"), _.get(error, "msg.data")].join(" "));
    };

    /* -----  End of BULK  ------ */

    init();
});
