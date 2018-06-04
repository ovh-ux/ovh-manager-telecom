(function () {
  angular.module('managerApp').component('voipTimeConditionSlot', {
    templateUrl: 'components/telecom/telephony/timeCondition/slot/telephony-time-condition-slot.html',
    bindings: {
      slot: '=timeConditionSlot',
      enableEdition: '<?slotEnableEdition',
      isScheduler: '<?',
    },
    controller: 'voipTimeConditionSlotCtrl',
  });
}());
