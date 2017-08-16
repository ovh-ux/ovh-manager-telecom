angular.module("managerApp").config(($stateProvider) => {
    "use strict";
    $stateProvider.state("telecom.sms.dashboard", {
        url: "",
        views: {
            smsInnerView: {
                templateUrl: "app/telecom/sms/dashboard/telecom-sms-dashboard.html",
                controller: "TelecomSmsDashboardCtrl",
                controllerAs: "SmsDashboardCtrl"
            }
        },
        translations: [
            "common",
            "telecom/sms/dashboard",
            "telecom/sms/sms/compose"
        ]
    });
});
