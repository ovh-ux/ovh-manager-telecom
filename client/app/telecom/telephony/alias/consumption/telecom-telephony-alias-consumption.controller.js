angular.module('managerApp').controller('TelecomTelephonyAliasConsumptionCtrl', function ($translate) {
  const self = this;

  self.actions = null;

  /*= =====================================
    =            INITIALIZATION            =
    ====================================== */

  function init() {
    self.actions = [{
      name: 'alias_consumption_incoming_calls',
      main: true,
      picto: 'ovh-font-callReceiving',
      sref: 'telecom.telephony.alias.consumption.incomingCalls',
      text: $translate.instant('telephony_alias_consumption_incoming_calls'),
    }, {
      name: 'alias_consumption_outgoing_calls',
      main: true,
      picto: 'ovh-font-callEmitting',
      sref: 'telecom.telephony.alias.consumption.outgoingCalls',
      text: $translate.instant('telephony_alias_consumption_outgoing_calls'),
    }];
  }

  /* -----  End of INITIALIZATION  ------*/

  init();
});
