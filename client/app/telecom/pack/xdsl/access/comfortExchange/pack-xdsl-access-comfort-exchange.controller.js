import { COMFORT_EXCHANGE_TYPE_ERROR } from './pack-xdsl-access-comfort-exchange.constant';

angular.module('managerApp').controller('XdslAccessComfortExchangeCtrl', class XdslAccessComfortExchangeCtrl {
  /* @ngInject */
  constructor($stateParams, $translate, OvhApiXdsl, TucToast, TucToastError) {
    this.$stateParams = $stateParams;
    this.$translate = $translate;
    this.OvhApiXdsl = OvhApiXdsl;
    this.TucToast = TucToast;
    this.TucToastError = TucToastError;
  }

  /*= =====================================
  =            INITIALIZATION            =
  ====================================== */
  $onInit() {
    this.exchange = {
      order: {
        url: null,
        id: null,
        priceWithoutTax: null,
        priceWithTax: null,
        tax: null,
      },
      isSuccess: false,
    };
    this.isAvailable = false;
    this.getListOpenedRMA();
  }

  getListOpenedRMA() {
    this.isRMAOpened = false;
    return this.OvhApiXdsl.RMA().v6().query({
      xdslId: this.xdslId,
    }).$promise.then((result) => {
      if (result.length > 0) {
        this.rmas = [];
        this.isRMAOpened = true;
        result.forEach(id => this.OvhApiXdsl.RMA().v6().getRMA({
          xdslId: this.xdslId,
        }, { id }).$promise.then((rma) => {
          const addRma = {
            creationDateTime: rma.creationDatetime,
            equipmentReference: rma.equipmentReference,
            id: rma.id,
            newMerchandise: rma.newMerchandise,
            status: rma.status,
          };
          this.rmas.push(addRma);
        }));
      }
    });
  }

  comfortExchange() {
    return this.OvhApiXdsl.Modem().v6().comfortExchange({
      xdslId: this.xdslId,
    }, {}).$promise.then((result) => {
      this.exchange.isSuccess = true;
      this.exchange.order.url = result.url;
      this.exchange.order.id = result.orderId;
      this.exchange.order.priceWithoutTax = result.priceWithoutTax.text;
      this.exchange.order.priceWithTax = result.priceWithTax.text;
      this.exchange.order.tax = result.tax.text;
      this.exchange.order.date = result.date;
      this.TucToast.success(this.$translate.instant('xdsl_access_comfort_exchange_success_message'));
    }).catch((error) => {
      if (error.data.message.includes(COMFORT_EXCHANGE_TYPE_ERROR.errBase)) {
        const typeError = error.data.message.substring(0, 6);
        this.TucToastError(this.$translate.instant(`xdsl_access_comfort_exchange_error_${typeError}`));
      } else if (error.data.message.includes(COMFORT_EXCHANGE_TYPE_ERROR.errContactShipping)) {
        this.TucToastError(this.$translate.instant('xdsl_access_comfort_exchange_error_contact_shipping'));
      } else {
        this.TucToastError(error);
      }
      this.isSelected = false;
    }).finally(() => {
      this.isAvailable = true;
    });
  }
});
