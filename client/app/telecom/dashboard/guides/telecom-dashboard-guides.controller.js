angular.module('managerApp').controller('TelecomDashboardGuidesCtrl', function (URLS, atInternet) {
  const self = this;

  self.links = null;

  /*= =====================================
    =            INITIALIZATION            =
    ====================================== */

  function init() {
    self.links = _.pick(URLS.guides, 'packActivate', 'modemConfig', 'modemReinit');
  }

  self.trackRedirection = function (link) {
    const hit = {
      type: 'navigation',
      level2: 'Telecom',
      chapter1: 'telecom',
    };

    switch (link) {
      case URLS.guides.packActivate:
        hit.cta = 'Activate my services';
        hit.name = 'Activation_Services';
        break;
      case URLS.guides.modemConfig:
        hit.cta = 'Configure my modem';
        hit.name = 'Setting_Modem';
        break;
      case URLS.guides.modemReinit:
        hit.cta = 'Restart my modem';
        hit.name = 'Reboot_Modem';
        break;
      default:
        break;
    }

    return atInternet.trackClick(hit);
  };

  /* -----  End of INITIALIZATION  ------*/

  init();
});
