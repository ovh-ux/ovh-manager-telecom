angular.module('managerApp').controller('XdslAccessComfortExchangeCtrl', class XdslAccessComfortExchangeCtrl {
  /* @ngInject */
  constructor($stateParams, $translate, OvhApiXdsl, TucToast, TucToastError,
    COMFORT_EXCHANGE_TYPE_ERROR) {
    this.$stateParams = $stateParams;
    this.$translate = $translate;
    this.OvhApiXdsl = OvhApiXdsl;
    this.TucToast = TucToast;
    this.TucToastError = TucToastError;
    this.COMFORT_EXCHANGE_TYPE_ERROR = COMFORT_EXCHANGE_TYPE_ERROR;
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
  }


  comfortExchange() {
    return this.OvhApiXdsl.Modem().v6().comfortExchange({
      xdslId: this.$stateParams.serviceName,
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
      if (error.data.message.includes(this.COMFORT_EXCHANGE_TYPE_ERROR.errBase)) {
        const typeError = error.data.message.substring(0, 6);
        this.TucToastError(this.$translate.instant(`xdsl_access_comfort_exchange_error_${typeError}`));
      } else if (error.data.message.includes(this.COMFORT_EXCHANGE_TYPE_ERROR.errContactShipping)) {
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
