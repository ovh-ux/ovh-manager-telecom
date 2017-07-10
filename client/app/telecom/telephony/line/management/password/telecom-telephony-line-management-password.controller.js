angular.module("managerApp").controller("TelecomTelephonyLinePasswordCtrl", function ($scope, $state, $stateParams, Toast, $q, $translate, Telephony) {
    "use strict";

    var self = this;

    self.loading = {
        save: false
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
            return Telephony.Line().Lexi().changePassword(
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
