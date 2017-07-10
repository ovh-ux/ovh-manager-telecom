angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.phone.accessories", {
        url: "/accessories",
        views: {
            "@lineView": {
                templateUrl: "app/telecom/telephony/line/phone/accessories/telecom-telephony-line-phone-accessories.html",
                controller: "TelecomTelephonyLinePhoneAccessoriesCtrl",
                controllerAs: "AccessoriesCtrl"
            },
            "@choiceView": {
                templateUrl: "app/telecom/telephony/line/phone/accessories/choice/telecom-telephony-line-phone-accessories-choice.html",
                controller: "TelecomTelephonyLinePhoneAccessoriesChoiceCtrl",
                controllerAs: "AccessoriesChoiceCtrl",
                noTranslations: true
            },
            "@shippingView": {
                templateUrl: "app/telecom/telephony/line/phone/accessories/shipping/telecom-telephony-line-phone-accessories-shipping.html",
                controller: "TelecomTelephonyLinePhoneAccessoriesShippingCtrl",
                controllerAs: "AccessoriesShippingCtrl",
                noTranslations: true
            },
            "@resumeView": {
                templateUrl: "app/telecom/telephony/line/phone/accessories/resume/telecom-telephony-line-phone-accessories-resume.html",
                controller: "TelecomTelephonyLinePhoneAccessoriesResumeCtrl",
                controllerAs: "AccessoriesResumeCtrl",
                noTranslations: true
            },
            "@finalizeView": {
                templateUrl: "app/telecom/telephony/line/phone/accessories/finalize/telecom-telephony-line-phone-accessories-finalize.html",
                controller: "TelecomTelephonyLinePhoneAccessoriesFinalizeCtrl",
                controllerAs: "AccessoriesFinalizeCtrl",
                noTranslations: true
            }
        },
        translations: ["common", "telecom/telephony/line/phone/accessories"]
    });
});
