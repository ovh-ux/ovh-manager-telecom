angular.module('managerApp').component('telecomV4Links', {
  templateUrl: 'components/telecom/v4-links/telecom-v4-links.html',
  bindings: {
    actions: '=telecomV4Links',
  },
  controller() {
    const self = this;

    self.actionRows = {
      main: null,
      normal: null,
    };

    /*= =====================================
    =            INITIALIZATION            =
    ====================================== */

    // self.$onInit = function () {
    const mainActions = _.filter(self.actions, action => action.main && !action.divider);

    self.actionRows.main = _.chunk(mainActions, 2);

    self.actionRows.normal = _.chain(self.actions)
      .difference(mainActions)
      .filter(action => !action.divider)
      .chunk(3)
      .value();

    /* -----  End of INITIALIZATION  ------*/
  },
});
