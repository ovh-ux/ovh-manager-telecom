angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.overTheBox.remote', {
    url: '/remote',
    views: {
      'otbView@telecom.overTheBox': {
        templateUrl: 'app/telecom/overTheBox/remote/overTheBox-remote.html',
        controller: 'OverTheBoxRemoteCtrl',
        controllerAs: 'OverTheBoxRemote',
      },
    },
    translations: ['.'],
  });
});
