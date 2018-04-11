angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony", {
        url: "/telephony/:billingAccount",
        views: {
            "telecomView@telecom": {
                templateUrl: "app/telecom/telephony/telecom-telephony.html"
            },
            "telephonyView@telecom.telephony": {
                templateUrl: "app/telecom/telephony/telecom-telephony-main.view.html"
            },
            "groupView@telecom.telephony": {
                templateUrl: "app/telecom/telephony/billingAccount/telecom-telephony-billing-account.html",
                controller: "TelecomTelephonyBillingAccountCtrl",
                controllerAs: "BillingAccountCtrl"
            },
            "groupInnerView@telecom.telephony": {
                templateUrl: "app/telecom/telephony/billingAccount/dashboard/telecom-telephony-billing-account-dashboard.html",
                controller: "TelecomTelephonyBillingAccountDashboardCtrl",
                controllerAs: "DashboardCtrl"
            }
        },
        resolve: {
            initTelephony: function ($q, $stateParams, TelephonyMediator) {
                // init all groups, lines and numbers
                TelephonyMediator.init().then(function () {
                    return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
                        return TelephonyMediator.setCurrentGroup(group);
                    });
                });
                return $q.when({ init: true });
            },
            $title: function (translations, $translate, $stateParams, OvhApiTelephony) {
                return OvhApiTelephony.v6().get({
                    billingAccount: $stateParams.billingAccount
                }).$promise.then(function (data) {
                    return $translate.instant("telephony_page_title", { name: data.description || $stateParams.billingAccount }, null, null, "escape");
                }).catch(function () {
                    return $translate("telephony_page_title", { name: $stateParams.billingAccount });
                });
            }
        },
        translations: ["common", "telecom/telephony"]
    });
});
