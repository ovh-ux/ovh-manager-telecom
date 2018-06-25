angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.freefax.voicemail-configuration', {
    url: '/voicemail',
    views: {
      'faxView@telecom.freefax': {
        templateUrl: 'app/telecom/freeFax/voicemailConfiguration/freeFax-voicemailConfiguration.html',
        controller: 'FreeFaxVoicemailConfigurationCtrl',
        controllerAs: 'VoicemailConf',
      },
    },
    translations: ['common', 'telecom/freeFax', 'telecom/freeFax/information', 'telecom/freeFax/faxConfiguration'],
  });
});
