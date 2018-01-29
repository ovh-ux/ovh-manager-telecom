angular.module("managerApp").controller("TelecomTelephonyLineClick2CallAddUserCtrl", function ($q, $stateParams, $state, $translate, OvhApiTelephony, TelephonyGroupLineClick2CallUser, Toast, telephonyBulk) {
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

    /* ===========================
    =            BULK            =
    ============================ */

    self.bulkDatas = {
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
        infos: {
            name: "click2Call",
            actions: [{
                name: "click2CallAddUser",
                route: "/telephony/{billingAccount}/line/{serviceName}/click2CallUser",
                method: "POST",
                params: null
            }]
        }
    };

    self.filterServices = function (services) {
        var filteredServices = _.filter(services, function (service) {
            return ["sip", "mgcp"].indexOf(service.featureType) > -1;
        });

        return _.filter(filteredServices, function (service) {
            return _.some(service.offers, _.method("includes", "sipfax")) ||
                _.some(service.offers, _.method("includes", "priceplan")) ||
                _.some(service.offers, _.method("includes", "voicefax"));
        });
    };

    self.getBulkParams = function () {
        var data = {
            login: self.login,
            password: self.password
        };

        return data;
    };

    self.onBulkSuccess = function (bulkResult) {
        // display message of success or error
        telephonyBulk.getToastInfos(bulkResult, {
            fullSuccess: $translate.instant("telephony_group_line_calls_click2call_addUser_bulk_all_success"),
            partialSuccess: $translate.instant("telephony_group_line_calls_click2call_addUser_bulk_some_success", {
                count: bulkResult.success.length
            }),
            error: $translate.instant("telephony_group_line_calls_click2call_addUser_bulk_error")
        }).forEach(function (toastInfo) {
            Toast[toastInfo.type](toastInfo.message, {
                hideAfter: null
            });
        });

        // reset initial values to be able to modify again the options
        OvhApiTelephony.Line().Click2Call().User().resetCache();
        self.close();
    };

    self.onBulkError = function (error) {
        Toast.error([$translate.instant("telephony_group_line_calls_click2call_addUser_bulk_on_error"), _.get(error, "msg.data")].join(" "));
    };

    /* -----  End of BULK  ------ */

});
