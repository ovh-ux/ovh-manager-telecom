angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.sms", {
        url: "/sms/:serviceName",
        views: {
            telecomView: {
                templateUrl: "app/telecom/sms/telecom-sms.html"
            },
            "@smsView": {
                templateUrl: "app/telecom/sms/telecom-sms-main.view.html",
                controller: "TelecomSmsCtrl",
                controllerAs: "TelecomSmsCtrl"
            }
        },
        "abstract": true,
        resolve: {
            initSms: function ($q, $stateParams, SmsMediator) {
                // init sms services
                SmsMediator.initAll().then(function (smsDetails) {
                    SmsMediator.setCurrentSmsService(smsDetails[$stateParams.serviceName]);
                });
                return $q.when({ init: true });
            },
            $title: function (translations, $translate, Sms, $stateParams) {
                return Sms.Lexi().get({
                    serviceName: $stateParams.serviceName
                }).$promise.then(function (data) {
                    return $translate.instant("sms_page_title", { name: data.description || $stateParams.serviceName }, null, null, "escape");
                }).catch(function () {
                    return $translate("sms_page_title", { name: $stateParams.serviceName });
                });
            }
        },
        translations: ["common", "telecom/sms"]
    });
});
