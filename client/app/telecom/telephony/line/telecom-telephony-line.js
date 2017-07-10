angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.line", {
        url: "/line/:serviceName",
        views: {
            "@telephonyView": {
                templateUrl: "app/telecom/telephony/line/telecom-telephony-line.html"
            },
            "@lineView": {
                templateUrl: "app/telecom/telephony/line/telecom-telephony-line-main.view.html",
                controller: "TelecomTelephonyLineCtrl",
                controllerAs: "LineCtrl"
            },
            "lineInnerView@telecom.telephony.line": {
                templateUrl: "app/telecom/telephony/line/management/telecom-telephony-line-management.html",
                controller: "TelecomTelephonyLineManagementCtrl",
                controllerAs: "LineManagementCtrl"
            }
        },
        translations: ["common", "telecom/telephony/line"],
        resolve: {
            $title: function (translations, $translate, $stateParams, Telephony) {
                return Telephony.Line().Lexi().get({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName
                }).$promise.then(function (data) {
                    return $translate.instant("telephony_line_page_title", { name: data.description || $stateParams.serviceName }, null, null, "escape");
                }).catch(function () {
                    return $translate("telephony_line_page_title", { name: $stateParams.serviceName });
                });
            }
        }
    });
});
