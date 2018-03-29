angular.module("managerApp").controller("TelecomTelephonyLinePhoneMgcpIpRestrictionCtrl", function ($q, $stateParams, $translate, IpAddress, OvhApiTelephony, OvhApiMe, Toast, ToastError, telephonyBulk) {
    "use strict";

    var self = this;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function fetchPhone () {
        return OvhApiTelephony.Line().Phone().v6().get({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise;
    }

    function fetchDefaultMgcpIpRestriction () {
        return OvhApiMe.Telephony().DefaultIpRestriction().v6().query().$promise.then(function (ids) {
            return $q.all(ids.map(function (id) {
                return OvhApiMe.Telephony().DefaultIpRestriction().v6().get({
                    id: id
                }).$promise;
            }));
        }).then(function (ips) {
            return _.find(ips, { type: "mgcp" });
        });
    }

    self.ipValidator = (function () {
        return {
            test: function (value) {
                return IpAddress.isValidPublicIp4(value);
            }
        };
    })();

    self.hasMgcpIpRestrictionChanged = function () {
        return !angular.equals(self.mgcpIpRestrictionForm.mgcpIpRestriction, self.mgcpIpRestriction.mgcpIpRestriction);
    };

    self.hasMgcpDefaultIpRestrictionChanged = function () {
        return !angular.equals(self.mgcpDefaultIpRestriction, self.mgcpDefaultIpRestrictionForm);
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.setMgcpIpRestriction = function () {
        self.isChangingMgcpIpRestriction = true;
        return OvhApiTelephony.Line().Phone().v6().edit({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, {
            mgcpIpRestriction: self.mgcpIpRestrictionForm.mgcpIpRestriction ? self.mgcpIpRestrictionForm.mgcpIpRestriction : null
        }).$promise.then(function () {
            Toast.success($translate.instant("telephony_line_phone_mgcp_ip_restriction_edit_success"));
            return fetchPhone().then(function (phone) {
                self.mgcpIpRestriction = _.pick(phone, "mgcpIpRestriction");
                self.mgcpIpRestrictionForm = angular.copy(self.mgcpIpRestriction);
            });
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_line_phone_mgcp_ip_restriction_edit_error"), (error.data && error.data.message) || ""].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.isChangingMgcpIpRestriction = false;
        });
    };

    self.setMgcpDefaultIpRestriction = function () {
        self.isChangingMgcpDefaultIpRestriction = true;
        var promise = $q.when();
        var subnet = _.get(self.mgcpDefaultIpRestrictionForm, "subnet");
        subnet = subnet.indexOf("/") >= 0 ? subnet : subnet + "/32";
        if (_.isEmpty(self.mgcpDefaultIpRestriction)) {
            promise = OvhApiMe.Telephony().DefaultIpRestriction().v6().create({
                subnet: subnet,
                type: "mgcp"
            }).$promise;
        } else {
            promise = OvhApiMe.Telephony().DefaultIpRestriction().v6().remove({
                id: _.get(self.mgcpDefaultIpRestriction, "id")
            }).$promise.then(function () {
                if (!_.isEmpty(subnet)) {
                    return OvhApiMe.Telephony().DefaultIpRestriction().v6().create({
                        subnet: subnet,
                        type: "mgcp"
                    }).$promise;
                }
                return null;
            });
        }
        return promise.then(function () {
            Toast.success($translate.instant("telephony_line_phone_mgcp_ip_restriction_edit_success"));
            return fetchDefaultMgcpIpRestriction().then(function (defaultMgcpIpRestriction) {
                self.mgcpDefaultIpRestriction = defaultMgcpIpRestriction;
                self.mgcpDefaultIpRestrictionForm = angular.copy(self.mgcpDefaultIpRestriction);
            });
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_line_phone_mgcp_ip_restriction_edit_error"), (error.data && error.data.message) || ""].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.isChangingMgcpDefaultIpRestriction = false;
        });
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.isLoading = true;
        return $q.all({
            phone: fetchPhone(),
            defaultMgcpIpRestriction: fetchDefaultMgcpIpRestriction()
        }).then(function (result) {
            self.mgcpIpRestriction = _.pick(result.phone, "mgcpIpRestriction");
            self.mgcpIpRestrictionForm = angular.copy(self.mgcpIpRestriction);
            self.mgcpDefaultIpRestriction = result.defaultMgcpIpRestriction;
            self.mgcpDefaultIpRestrictionForm = angular.copy(self.mgcpDefaultIpRestriction);
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isLoading = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    self.bulkDatas = {
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
        infos: {
            name: "phone",
            actions: [{
                name: "phone",
                route: "/telephony/{billingAccount}/line/{serviceName}/phone",
                method: "PUT",
                params: null
            }]
        }
    };

    self.filterServices = function (services) {
        return _.filter(services, function (service) {
            return ["mgcp"].indexOf(service.featureType) > -1;
        });
    };

    self.getBulkParams = function () {
        return {
            mgcpIpRestriction: self.mgcpIpRestrictionForm.mgcpIpRestriction || null
        };
    };

    self.onBulkSuccess = function (bulkResult) {
        // display message of success or error
        telephonyBulk.getToastInfos(bulkResult, {
            fullSuccess: $translate.instant("telephony_line_phone_mgcp_ip_restriction_bulk_all_success"),
            partialSuccess: $translate.instant("telephony_line_phone_mgcp_ip_restriction_bulk_some_success", {
                count: bulkResult.success.length
            }),
            error: $translate.instant("telephony_line_phone_mgcp_ip_restriction_bulk_error")
        }).forEach(function (toastInfo) {
            Toast[toastInfo.type](toastInfo.message, {
                hideAfter: null
            });
        });

        OvhApiTelephony.Line().Phone().v6().resetAllCache();

        init();
    };

    self.onBulkError = function (error) {
        Toast.error([$translate.instant("telephony_line_phone_mgcp_ip_restriction_bulk_on_error"), _.get(error, "msg.data")].join(" "));
    };

    init();
});
