angular.module("managerApp").controller("TelecomTelephonyLineClick2CallChangePasswordCtrl", function ($q, $stateParams, $state, $translate, TelephonyGroupLineClick2CallUser, Toast) {
    "use strict";

    var self = this;

    this.rules = [
        {
            id: "length",
            caption: $translate.instant("telephony_group_line_calls_click2call_changePassword_rule_size"),
            validator: function (str) {
                return str && str.length > 7 && str.length < 21;
            }
        },
        {
            id: "specialChar",
            caption: $translate.instant("telephony_group_line_calls_click2call_changePassword_rule_special", { list: "#{}()[]-|@=*+/!:;" }),
            validator: /^[\w~"#'\{\}\(\\)[\]\-\|\\^@=\*\+\/!:;.,?<>%*µÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ]+$/,
            immediateWarning: true
        }
    ];

    this.getStrength = function (val) {
        return (val.length - 8) / 12;
    };

    this.changePassword = function () {
        this.loading.changePassword = true;

        return this.user.changePassword(self.password).then(function () {
            Toast.success($translate.instant("telephony_group_line_calls_click2call_changePassword_success", { name: self.user.login }));
            self.close();
            return self.user;
        }, function (error) {
            Toast.error($translate.instant("telephony_group_line_calls_click2call_changePassword_fail", { name: self.user.login }));
            return $q.reject(error);
        }).finally(function () {
            self.loading.changePassword = false;
        });
    };


    this.close = function () {
        $state.go("telecom.telephony.line.click2call", {
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        });
    };

    function init () {
        self.loading = {
            changePassword: false,
            readUser: true
        };

        self.user = new TelephonyGroupLineClick2CallUser({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, {
            id: $stateParams.userId
        });

        return self.user.getUser().then(function (data) {
            self.user.login = data.login;
        }).catch(function (err) {
            return $q.reject(err);
        }).finally(function () {
            self.loading.readUser = false;
        });
    }

    init();
});
