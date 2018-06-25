angular.module('managerApp').controller('voipTimeConditionSlotCtrl', function () {
  const self = this;

  /*= ==============================
    =            HELPERS            =
    =============================== */

  self.getSlotDetail = function (property) {
    return _.get(self.slot.inEdition && self.slot.saveForEdition ?
      self.slot.saveForEdition : self.slot, property);
  };

  /* -----  End of HELPERS  ------*/
});
