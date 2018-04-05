angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.assist.troubleshooting", {
        url: "/troubleshooting",
        resolve: {
            // this is the object that will be used by each view to display the different steps
            troubleshootingProcess: function () {
                return {
                    phoneType: null,
                    problem: null,
                    line: null,
                    activeStep: null
                };
            }
        },
        views: {
            "lineView@telecom.telephony.line": {
                templateUrl: "app/telecom/telephony/line/assist/troubleshooting/telecom-telephony-line-assist-troubleshooting.html",
                controller: "TelecomTelephonyLineAssistTroubleshootingCtrl",
                controllerAs: "TroubleshootingCtrl"
            },
            "procedureStepView@telecom.telephony.line.assist.troubleshooting": {
                templateUrl: "app/telecom/telephony/line/assist/troubleshooting/procedure/telecom-telephony-line-assist-troubleshooting-procedure.html",
                controller: "TelecomTelephonyLineAssistTroubleshootingProcedureCtrl",
                controllerAs: "ProcedureCtrl"
            },
            "autoConfigStepView@telecom.telephony.line.assist.troubleshooting": {
                templateUrl: "app/telecom/telephony/line/assist/troubleshooting/autoConfig/telecom-telephony-line-assist-troubleshooting-auto-config.html",
                controller: "TelecomTelephonyLineAssistTroubleshootingAutoConfigCtrl",
                controllerAs: "AutoConfigCtrl"
            },
            "manualConfigStepView@telecom.telephony.line.assist.troubleshooting": {
                templateUrl: "app/telecom/telephony/line/assist/troubleshooting/manualConfig/telecom-telephony-line-assist-troubleshooting-manual-config.html",
                controller: "TelecomTelephonyLineAssistTroubleshootingManualConfigCtrl",
                controllerAs: "ManualConfigCtrl"
            }
        },
        translations: ["common", "telecom/telephony/line/assist/troubleshooting"]
    });
});
