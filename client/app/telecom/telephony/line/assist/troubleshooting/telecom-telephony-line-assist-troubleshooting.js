angular.module('managerApp').run(($templateCache) => {
    // import templates required by ng-include
    $templateCache.put("app/telecom/telephony/line/assist/troubleshooting/procedure/cisco/telecom-telephony-line-assist-troubleshooting-procedure-cisco.html", require("./procedure/cisco/telecom-telephony-line-assist-troubleshooting-procedure-cisco.html"));
    $templateCache.put("app/telecom/telephony/line/assist/troubleshooting/procedure/gigaset/telecom-telephony-line-assist-troubleshooting-procedure-gigaset.html", require("./procedure/gigaset/telecom-telephony-line-assist-troubleshooting-procedure-gigaset.html"));
    $templateCache.put("app/telecom/telephony/line/assist/troubleshooting/procedure/lg/telecom-telephony-line-assist-troubleshooting-procedure-lg.html", require("./procedure/lg/telecom-telephony-line-assist-troubleshooting-procedure-lg.html"));
    $templateCache.put("app/telecom/telephony/line/assist/troubleshooting/procedure/linksys/telecom-telephony-line-assist-troubleshooting-procedure-linksys.html", require("./procedure/linksys/telecom-telephony-line-assist-troubleshooting-procedure-linksys.html"));
    $templateCache.put("app/telecom/telephony/line/assist/troubleshooting/procedure/polycom/telecom-telephony-line-assist-troubleshooting-procedure-polycom.html", require("./procedure/polycom/telecom-telephony-line-assist-troubleshooting-procedure-polycom.html"));
    $templateCache.put("app/telecom/telephony/line/assist/troubleshooting/procedure/siemens/telecom-telephony-line-assist-troubleshooting-procedure-siemens.html", require("./procedure/siemens/telecom-telephony-line-assist-troubleshooting-procedure-siemens.html"));
    $templateCache.put("app/telecom/telephony/line/assist/troubleshooting/procedure/thomson/telecom-telephony-line-assist-troubleshooting-procedure-thomson.html", require("./procedure/thomson/telecom-telephony-line-assist-troubleshooting-procedure-thomson.html"));
});
angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.telephony.line.assist.troubleshooting', {
    url: '/troubleshooting',
    resolve: {
      // this is the object that will be used by each view to display the different steps
      troubleshootingProcess() {
        return {
          phoneType: null,
          problem: null,
          line: null,
          activeStep: null,
        };
      },
    },
    views: {
      'lineView@telecom.telephony.line': {
        templateUrl: 'app/telecom/telephony/line/assist/troubleshooting/telecom-telephony-line-assist-troubleshooting.html',
        controller: 'TelecomTelephonyLineAssistTroubleshootingCtrl',
        controllerAs: 'TroubleshootingCtrl',
      },
      'procedureStepView@telecom.telephony.line.assist.troubleshooting': {
        templateUrl: 'app/telecom/telephony/line/assist/troubleshooting/procedure/telecom-telephony-line-assist-troubleshooting-procedure.html',
        controller: 'TelecomTelephonyLineAssistTroubleshootingProcedureCtrl',
        controllerAs: 'ProcedureCtrl',
      },
      'autoConfigStepView@telecom.telephony.line.assist.troubleshooting': {
        templateUrl: 'app/telecom/telephony/line/assist/troubleshooting/autoConfig/telecom-telephony-line-assist-troubleshooting-auto-config.html',
        controller: 'TelecomTelephonyLineAssistTroubleshootingAutoConfigCtrl',
        controllerAs: 'AutoConfigCtrl',
      },
      'manualConfigStepView@telecom.telephony.line.assist.troubleshooting': {
        templateUrl: 'app/telecom/telephony/line/assist/troubleshooting/manualConfig/telecom-telephony-line-assist-troubleshooting-manual-config.html',
        controller: 'TelecomTelephonyLineAssistTroubleshootingManualConfigCtrl',
        controllerAs: 'ManualConfigCtrl',
      },
    },
    translations: [
      'telecom/telephony/line/assist/troubleshooting',
      'telecom/telephony/line/assist/troubleshooting/autoConfig',
      'telecom/telephony/line/assist/troubleshooting/manualConfig',
    ],
  });
});
