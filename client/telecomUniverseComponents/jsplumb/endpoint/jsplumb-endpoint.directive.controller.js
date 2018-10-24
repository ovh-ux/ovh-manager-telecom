import _ from 'lodash';

export default function () {
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
}
