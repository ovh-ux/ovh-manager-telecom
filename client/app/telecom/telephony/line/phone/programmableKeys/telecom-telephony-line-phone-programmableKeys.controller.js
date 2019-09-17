export default class TelecomTelephonyLinePhoneProgammableKeysCtrl {
  /* @ngInject */
  constructor($stateParams, $translate, $uibModal, TelephonyMediator, tucTelephonyBulk, TucToast) {
    this.$stateParams = $stateParams;
    this.$translate = $translate;
    this.$uibModal = $uibModal;
    this.TelephonyMediator = TelephonyMediator;
    this.tucTelephonyBulk = tucTelephonyBulk;
    this.TucToast = TucToast;
  }

  $onInit() {
    this.loading = {
      init: true,
      keys: false,
    };

    this.hasPhone = false;
    this.order = {
      by: 'keyNum',
      desc: false,
    };

    this.functionKeys = {
      raw: null,
      paginated: null,
    };

    this.bulkDatas = {
      infos: {
        name: 'functionKeys',
        actions: [{
          name: '',
        }],
      },
    };

    return this.initLines();
  }

  initLines() {
    return this.TelephonyMediator.getGroup(this.$stateParams.billingAccount).then((group) => {
      this.group = group;
      this.line = this.group.getLine(this.$stateParams.serviceName);

      return this.getPhone();
    }).finally(() => {
      this.loading.init = false;
    });
  }

  orderBy(by) {
    if (this.order.by === by) {
      this.order.desc = !this.order.desc;
    } else {
      this.order.by = by;
    }
  }

  edit(functionKey) {
    const modal = this.$uibModal.open({
      animation: true,
      templateUrl: 'app/telecom/telephony/line/phone/programmableKeys/edit/telecom-telephony-line-phone-programmableKeys-edit.html',
      controller: 'TelecomTelephonyLinePhoneProgammableKeysEditCtrl',
      controllerAs: 'ProgammableKeysEditCtrl',
      resolve: {
        functionKey() { return functionKey; },
      },
    });

    modal.result.then(() => this.getPhone(), (error) => {
      if (error && error.type === 'API') {
        this.TucToast.error(this.$translate.instant('telephony_line_phone_programmableKeys_save_error', { error: error.msg }));
      }
      return this.getPhone();
    });

    return modal;
  }


  /* -----  End of INITIALIZATION  ------*/

  getPhone() {
    const regexp = new RegExp(/[a-z]+|[\d.-_]+/ig);
    const complexNumericRegExp = new RegExp(/\d+/g);

    function sortFunctionKeys(a, b) {
      const [alphaA, numericA] = a.label.match(regexp);
      const [alphaB, numericB] = b.label.match(regexp);
      if (alphaA === alphaB) {
        const [numericA1, numericA2] = numericA.match(complexNumericRegExp);
        const [numericB1, numericB2] = numericB.match(complexNumericRegExp);

        if (numericA1 === numericB1) {
          return parseInt(numericA2, 10) > parseInt(numericB2, 10) ? 1 : -1;
        }
        return parseInt(numericA, 10) > parseInt(numericB, 10) ? 1 : -1;
      }
      return alphaA > alphaB ? 1 : -1;
    }

    return this.line.getPhone().then(() => {
      if (this.line.hasPhone) {
        return this.line.phone.initDeffered().then(() => {
          this.functionKeys.raw = _.cloneDeep(this.line.phone.functionKeys);
          this.functionKeys.raw.sort(sortFunctionKeys);
        });
      }
      return null;
    });
  }

  /* ===========================
  =            BULK            =
  ============================ */

  getBulkParams() {
    this.bulkDatas.infos.actions = this.buildBulkActions();
  }

  buildBulkActions() {
    return _.map(this.functionKeys.raw, key => ({
      name: 'functionKey',
      route: '/telephony/{billingAccount}/line/{serviceName}/phone/functionKey/{keyNum}'.replace('{keyNum}', key.keyNum),
      method: 'PUT',
      params: {
        function: key.function,
        parameter: key.parameter,
      },
    }));
  }

  /* eslint-disable class-methods-use-this */
  filterServices(services) {
    const filteredServices = _.filter(services, service => ['sip', 'mgcp'].indexOf(service.featureType) > -1);

    return _.filter(
      filteredServices,
      service => _.find(services, {
        serviceName: service.serviceName,
        billingAccount: service.billingAccount,
      }),
    );
  }
  /* eslint-enable class-methods-use-this */

  onBulkSuccess() {
    return (bulkResult) => {
      if (bulkResult.error.length) {
        _.set(bulkResult, 'error', _.map(bulkResult.error, (error) => {
          const errorDetails = _.get(error, 'errors[0]');
          _.set(error, 'errors[0].error', errorDetails.statusCode === 501
            ? this.$translate.instant('telephony_line_phone_programmableKeys_bulk_error_details') : errorDetails.error);

          return error;
        }));
      }

      // display message of success or error
      this.tucTelephonyBulk.getTucToastInfos(bulkResult, {
        fullSuccess: this.$translate.instant('telephony_line_phone_programmableKeys_bulk_all_success'),
        partialSuccess: this.$translate.instant('telephony_line_phone_programmableKeys_bulk_some_success', {
          count: bulkResult.success.length,
        }),
        error: this.$translate.instant('telephony_line_phone_programmableKeys_bulk_error'),
      }, true).forEach((toastInfo) => {
        this.TucToast[toastInfo.type](toastInfo.message, {
          hideAfter: null,
        });
      });

      // reset initial values to be able to modify again the options
      this.TelephonyMediator.resetAllCache();
      return this.initLines();
    };
  }

  onBulkError() {
    return error => this.TucToast.error([this.$translate.instant('telephony_line_phone_programmableKeys_bulk_on_error'), _.get(error, 'msg.data')].join(' '));
  }

  /* -----  End of BULK  ------ */
}

angular.module('managerApp').controller('TelecomTelephonyLinePhoneProgammableKeysCtrl', TelecomTelephonyLinePhoneProgammableKeysCtrl);
