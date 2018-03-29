angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.alias", {
        url: "/alias/:serviceName",
        views: {
            "telephonyView@telecom.telephony": {
                templateUrl: "app/telecom/telephony/alias/telecom-telephony-alias.html"
            },
            "aliasView@telecom.telephony.alias": {
                templateUrl: "app/telecom/telephony/alias/telecom-telephony-alias-main.view.html",
                controller: "TelecomTelephonyAliasCtrl",
                controllerAs: "AliasCtrl"
            },
            "aliasInnerView@telecom.telephony.alias": {
                templateUrl: "app/telecom/telephony/alias/portability/telecom-telephony-alias-portability.html",
                controller: "TelecomTelephonyAliasPortabilityCtrl",
                controllerAs: "AliasPortabilityCtrl"
            }
        },
        translations: ["common", "telecom/telephony/alias"],
        resolve: {
            $title: function (translations, $translate, $stateParams, OvhApiTelephony) {
                return OvhApiTelephony.Number().v6().get({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName
                }).$promise.then(function (data) {
                    return $translate.instant("telephony_alias_page_title", { name: data.description || $stateParams.serviceName }, null, null, "escape");
                }).catch(function () {
                    return $translate("telephony_alias_page_title", { name: $stateParams.serviceName });
                });
            }
        }
    });
});
