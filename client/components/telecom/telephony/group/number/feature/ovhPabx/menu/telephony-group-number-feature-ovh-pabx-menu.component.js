(function () {
  angular.module('managerApp').component('telephonyNumberOvhPabxMenu', {
    templateUrl: 'components/telecom/telephony/group/number/feature/ovhPabx/menu/telephony-group-number-feature-ovh-pabx-menu.html',
    require: {
      numberCtrl: '^^?telephonyNumber',
      dialplanCtrl: '^^?telephonyNumberOvhPabxDialplan',
      extensionCtrl: '^^?telephonyNumberOvhPabxDialplanExtension',
      menuCtrl: '^^?telephonyNumberOvhPabxMenu',
    },
    bindings: {
      ovhPabx: '=?ovhPabx',
      jsplumbInstance: '=?ovhPabxMenuJsplumbInstance',
      menu: '=ovhPabxMenu',
      menuEntry: '=?ovhPabxMenuEntry',
      dialplanRule: '=?dialplanRule',
    },
    controller: 'telephonyNumberOvhPabxMenuCtrl',
  });
}());
