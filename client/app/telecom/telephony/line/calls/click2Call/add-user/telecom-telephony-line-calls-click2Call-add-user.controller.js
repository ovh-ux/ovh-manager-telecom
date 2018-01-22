angular.module("managerApp").controller("TelecomTelephonyLineClick2CallAddUserCtrl", function ($q, $stateParams, $state, $translate, TelephonyGroupLineClick2CallUser, Toast) {
    "use strict";

    var self = this;

    this.rules = [
        {
            id: "length",
            caption: $translate.instant("telephony_group_line_calls_click2call_addUser_rule_size"),
            validator: function (str) {
                return str && str.length > 7 && str.length < 21;
            }
        },
        {
            id: "specialChar",
            caption: $translate.instant("telephony_group_line_calls_click2call_addUser_rule_special", { list: "#{}()[]-|@=*+/!:;" }),
            validator: /^[\w~"#'\{\}\(\\)[\]\-\|\\^@=\*\+\/!:;.,?<>%*µÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ]+$/,
            immediateWarning: true
        }
    ];

    this.getStrength = function (val) {
        return (val.length - 8) / 12;
    };

    this.loading = {
        addUser: false
    };

    this.add = function () {
        this.loading.addUser = true;

        this.user = new TelephonyGroupLineClick2CallUser({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, {
            login: self.login,
            password: self.password
        });

        return this.user.add().then(function () {
            Toast.success($translate.instant("telephony_group_line_calls_click2call_addUser_added", { name: self.user.login }));
            self.close();
            return self.user;
        }, function (error) {
            Toast.error($translate.instant("telephony_group_line_calls_click2call_addUser_fail", { name: self.user.login }));
            return $q.reject(error);
        }).finally(function () {
            self.loading.addUser = false;
        });
    };

    this.close = function () {
        $state.go("telecom.telephony.line.click2call", {
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        });
    };

});
