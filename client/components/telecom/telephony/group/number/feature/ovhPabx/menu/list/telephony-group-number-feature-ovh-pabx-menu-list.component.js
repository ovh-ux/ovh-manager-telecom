(function () {
  angular.module('managerApp').component('telephonyNumberOvhPabxMenuList', {
    templateUrl: 'components/telecom/telephony/group/number/feature/ovhPabx/menu/list/telephony-group-number-feature-ovh-pabx-menu-list.html',
    require: {
      numberCtrl: '^^?telephonyNumber',
      ovhPabxCtrl: '^^?telephonyNumberOvhPabx',
    },
    bindings: {
      ovhPabx: '=?ovhPabx',
      selectedMenu: '=?ngModel',
      withChoice: '<?',
      radioName: '@?',
      disableMenuId: '<?',
      onMenuSelected: '&?',
    },
    controller: 'telephonyNumberOvhPabxMenuListCtrl',
  });
}());
