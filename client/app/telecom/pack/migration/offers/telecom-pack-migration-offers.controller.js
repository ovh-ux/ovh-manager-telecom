angular.module('managerApp').controller('TelecomPackMigrationOffersCtrl', function ($q, $translate, PackMigrationProcess, Toast) {
  const self = this;

  self.process = null;
  self.loading = {
    init: false,
  };

  /*= ==============================
  =            ACTIONS            =
  =============================== */

  self.updateOfferDisplayedPrice = function (offer) {
    let totalOfferPrice = offer.price.value;

    angular.forEach(offer.options, (option) => {
      if (option.name === 'gtr_ovh' && option.selected) {
        totalOfferPrice += option.optionalPrice.value;
      } else if (option.name !== 'gtr_ovh' && !_.isUndefined(option.choosedValue)) {
        totalOfferPrice += option.choosedValue * option.optionalPrice.value;
      }
    });

    _.set(offer, 'displayedPrice', PackMigrationProcess.getPriceStruct(totalOfferPrice));
  };

  self.selectOffer = function (offer) {
    PackMigrationProcess.selectOffer(offer);
  };

  /* -----  End of ACTIONS  ------*/

  /*= ==============================
  =            HELPERS            =
  =============================== */

  self.hasOfferWithSubServicesToDelete = function () {
    return !!_.find(self.process.migrationOffers.result.offers, offer =>
      offer.totalSubServiceToDelete > 0);
  };

  /* -----  End of HELPERS  ------*/

  /*= =====================================
  =            INITIALIZATION            =
  ====================================== */

  function init() {
    self.loading.init = true;

    return PackMigrationProcess.initOffersView().then((migrationProcess) => {
      self.process = migrationProcess;
    }, (error) => {
      Toast.error([$translate.instant('telecom_pack_migration_offer_choice_error_loading'), _.get(error, 'data.message', '')].join(' '));
      return $q.reject(error);
    }).finally(() => {
      self.loading.init = false;
    });
  }

  /* -----  End of INITIALIZATION  ------*/

  init();
});
