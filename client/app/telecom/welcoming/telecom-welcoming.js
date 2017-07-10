angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.welcoming", {
        url: "/",
        views: {
            telecomView: {
                templateUrl: "app/telecom/welcoming/telecom-welcoming.html",
                controller: "TelecomWelcomingCtrl",
                controllerAs: "Welcoming"
            }
        },
        translations: ["common", "telecom/welcoming"],
        resolve: {
            $title: function (translations, $translate) {
                return $translate.instant("telecom_welcoming_page_title");
            }
        }
    });
});
