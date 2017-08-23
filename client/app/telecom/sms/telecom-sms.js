angular.module("managerApp").config(($stateProvider) => {
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
            initSms: ($q, $stateParams, SmsMediator) => {
                // init sms services
                SmsMediator.initAll().then((smsDetails) =>
                    SmsMediator.setCurrentSmsService(smsDetails[$stateParams.serviceName])
                );
                return $q.when({ init: true });
            },
            $title: (translations, $translate, Sms, $stateParams) => {
                Sms.Lexi().get({
                    serviceName: $stateParams.serviceName
                }).$promise.then((data) =>
                    $translate.instant("sms_page_title", { name: data.description || $stateParams.serviceName }, null, null, "escape")
                ).catch(() => $translate("sms_page_title", { name: $stateParams.serviceName }));
            }
        },
        translations: [
            "common",
            "telecom/sms"
        ]
    });
});
