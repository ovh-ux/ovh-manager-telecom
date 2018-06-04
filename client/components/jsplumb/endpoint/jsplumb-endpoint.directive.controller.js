angular.module('managerApp').controller('jsplumbEndpointCtrl', function () {
  const self = this;

  self.endpoint = null;

  /*= =====================================
    =            INITIALIZATION            =
    ====================================== */

  self.$onInit = function () {
    if (!self.uuid) {
      self.uuid = _.uniqueId('endpoint_');
    }
  };

  /* -----  End of INITIALIZATION  ------*/
});
