angular.module("managerApp").controller("TelecomTelephonyLinePasswordCtrl", function ($scope, $state, $stateParams, Toast, $q, $translate, OvhApiTelephony, telephonyBulk, voipLine) {
    "use strict";

    var self = this;

    self.init = function () {
        self.password = null;
    };

    self.loading = {
        save: false
    };

    self.bulkDatas = {
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
        infos: {
            name: "password",
            actions: [{
                name: "changePassword",
                route: "/telephony/{billingAccount}/line/{serviceName}/changePassword",
                method: "POST",
                params: null
            }]
        }
    };

    self.getBulkParams = function () {
        return {
            password: self.password
        };
    };

    self.filterServices = function (services) {

        var filteredServices = _.filter(services, function (service) {
            return ["sip"].indexOf(service.featureType) > -1;
        });

        var promises = _.map(filteredServices, function (service) {
            return voipLine.fetchLineInfo(service);
        });

        return $q.allSettled(promises)
            .then(function (listLines) { return listLines; })
            .catch(function (listLines) { return listLines; })
            .then(function (listLines) {
                return $q.when(_.filter(filteredServices, function (service) {
                    return _.some(listLines, { serviceName: service.serviceName, canChangePassword: true });
                }));
            });
    };

    self.onBulkSuccess = function (bulkResult) {
        // display message of success or error
        telephonyBulk.getToastInfos(bulkResult, {
            fullSuccess: $translate.instant("telephony_line_password_bulk_all_success"),
            partialSuccess: $translate.instant("telephony_line_password_bulk_some_success", {
                count: bulkResult.success.length
            }),
            error: $translate.instant("telephony_line_password_bulk_error")
        }).forEach(function (toastInfo) {
            Toast[toastInfo.type](toastInfo.message, {
                hideAfter: null
            });
        });

        // reset initial values to be able to modify again the options
        self.init();
    };

    self.onBulkError = function (error) {
        Toast.error([$translate.instant("telephony_line_password_bulk_on_error"), _.get(error, "msg.data")].join(" "));
    };

    this.validators = [
        {
            id: "length",
            caption: $translate.instant("telephony_line_password_rule_size"),
            validator: function (str) {
                return str && str.length > 7 && str.length < 21;
            }
        },
        {
            id: "palindrome",
            caption: $translate.instant("telephony_line_password_rule_palindrome"),
            validator: function (val) {
                if (!val) {
                    return false;
                }
                var palindrome = true;
                for (var i = 0; i < Math.floor(val.length / 2); i++) {
                    if (val[i] !== val[val.length - 1 - i]) {
                        palindrome = false;
                    }
                }
                return !palindrome;
            },
            immediateWarning: true
        },
        {
            id: "specialChar",
            caption: $translate.instant("telephony_line_password_rule_special", { list: "#{}()[]-|@=*+/!:;" }),
            validator: /^[\w~"#'\{\}\(\\)[\]\-\|\\^@=\*\+\/!:;.,?<>%*µ]+$/,
            immediateWarning: true
        },
        {
            id: "class",
            caption: $translate.instant("telephony_line_password_rule_class"),
            validator: function (val) {
                var classCount = 0;
                if (/[0-9]/.test(val)) {
                    classCount++;
                }
                if (/[a-zA-Z]/.test(val)) {
                    classCount++;
                }
                if (/[^a-zA-Z0-9]/.test(val)) {
                    classCount++;
                }
                return classCount >= 2;
            }
        }
    ];

    this.getStrength = function (value) {
        return (value.length - 8) / 12;
    };

    /**
     * Cancel modifications and leave the page
     */
    this.cancel = function () {
        $state.go(
            $state.current.name.split(".").slice(0, -1).join("."),
            $stateParams,
            {
                reload: true
            }
        );
    };

    /**
     * Save the passwords
     * @return {Promise}
     */
    this.save = function () {
        if (!$scope.passwordForm.$invalid) {
            self.loading.save = true;
            return OvhApiTelephony.Line().v6().changePassword(
                {
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName
                },
                {
                    password: this.password
                }
            ).$promise.then(function () {
                Toast.success($translate.instant("telephony_line_password_save_success"));
                self.cancel();
            }).catch(function (err) {
                Toast.error($translate.instant("telephony_line_password_save_fail"));
                return $q.reject(err);
            }).finally(function () {
                self.loading.save = false;
            });
        }
        return $q.when(null);
    };

});
