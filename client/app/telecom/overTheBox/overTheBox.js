angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.overTheBox", {
        url: "/overTheBox/:serviceName",
        "abstract": true,
        views: {
            "telecomView@telecom": {
                templateUrl: "app/telecom/overTheBox/overTheBox.html",
                controller: "OverTheBoxCtrl",
                controllerAs: "OverTheBox"
            }
        },
        translations: [
            "common",
            "telecom/overTheBox/details",
            "telecom/overTheBox/warning",
            "telecom/overTheBox/remote"
        ],
        resolve: {
            $title: function (translations, $translate, $stateParams, OvhApiOverTheBox) {
                return OvhApiOverTheBox.v6().get({
                    serviceName: $stateParams.serviceName
                }).$promise.then(function (data) {
                    return $translate.instant("overTheBox_page_title", { name: data.customerDescription || $stateParams.serviceName }, null, null, "escape");
                }).catch(function () {
                    return $translate("overTheBox_page_title", { name: $stateParams.serviceName });
                });
            }
        }
    });
});
