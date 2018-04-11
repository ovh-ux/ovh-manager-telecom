angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.line", {
        url: "/line/:serviceName",
        views: {
            "telephonyView@telecom.telephony": {
                templateUrl: "app/telecom/telephony/line/telecom-telephony-line.html"
            },
            "lineView@telecom.telephony.line": {
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
            currentLine: function ($stateParams, OvhApiTelephony) {
                return OvhApiTelephony.Line().v6().get({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName
                }).$promise.then(function (line) {
                    return OvhApiTelephony.Line().v6().simultaneousChannelsDetails({
                        billingAccount: $stateParams.billingAccount,
                        serviceName: $stateParams.serviceName
                    }).$promise.then(function (details) {
                        return details;
                    }).catch(function () {
                        return null;
                    }).then(function (details) {
                        return _.merge(line, {
                            simultaneousLinesDetails: details || null
                        });
                    });
                }).catch(function () {
                    return {};
                });
            },
            $title: function (translations, $stateParams, $translate, currentLine) {
                return $translate.instant("telephony_line_page_title", { name: currentLine.description || $stateParams.serviceName }, null, null, "escape");
            }
        }
    });
});
