angular.module('managerApp').controller('shippingModeSelectionCtrl', function ($q, $translate, $translatePartialLoader) {
  const self = this;
  const allowedModes = ['mondialRelay', 'transporter'];

  self.loading = {
    init: false,
    contact: false,
    translations: false,
  };

  self.contactFullList = null;

  /*= ==============================
    =            HELPERS            =
    =============================== */

  function checkOptions() {
    self.options = _.defaults(self.options || {}, {
      forceContactSelect: false,
      payForRelay: false,
      disableMondialRelay: false,
      disableTransporter: false,
      shippingPrice: 9.99,
    });

    if (self.options.disableMondialRelay && self.options.disableTransporter) {
      throw new Error('shippingModeSelection component : you cannot disable mondialRelay AND transporter modes !');
    }

    if (!self.selectedMode) {
      self.selectedMode = self.options.disableMondialRelay ? 'transporter' : 'mondialRelay';
    } else if (allowedModes.indexOf(self.selectedMode) === -1) {
      throw new Error(`shippingModeSelection component : ${self.selectedMode} is not an allowed value for shippingModeSelectionMode parameter.`);
    }
  }

  /* -----  End of HELPERS  ------*/

  /*= ==============================
    =            ACTIONS            =
    =============================== */

  self.resetValues = function () {
    if (self.selectedMode === 'mondialRelay' && !self.options.forceContactSelect) {
      self.shippingContact = null;
    } else if (self.selectedMode === 'transporter') {
      self.selectedRelay = null;
    }
  };

  /* -----  End of ACTIONS  ------*/

  /*= =====================================
    =            INITIALIZATION            =
    ====================================== */

  function loadTranslations() {
    self.loading.translations = true;
    $translatePartialLoader.addPart('../components/shippingModeSelection');
    return $translate.refresh().finally(() => {
      self.loading.translations = false;
    });
  }

  self.$onInit = function () {
    self.loading.init = true;

    checkOptions();

    return loadTranslations()
      .then(() => (self.onInitialized ? self.onInitialized() : []))
      .finally(() => {
        self.loading.init = false;
      });
  };

  /* -----  End of INITIALIZATION  ------*/
});
