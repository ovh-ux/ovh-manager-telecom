angular.module('managerApp').controller('TelecomTelephonyAliasSpecialRsvaCtrl', class TelecomTelephonyAliasSpecialRsvaCtrl {
  constructor(
    $filter, $q, $stateParams, $translate,
    costs, OvhApiOrder, OvhApiTelephony, OvhApiTelephonyService, telephonyBulk, TucToast, URLS,
  ) {
    this.$filter = $filter;
    this.$q = $q;
    this.serviceName = $stateParams.serviceName;
    this.billingAccount = $stateParams.billingAccount;
    this.$translate = $translate;
    this.costs = costs;
    this.OvhApiOrder = OvhApiOrder;
    this.OvhApiTelephony = OvhApiTelephony;
    this.OvhApiTelephonyService = OvhApiTelephonyService;
    this.telephonyBulk = telephonyBulk;
    this.TucToast = TucToast;
    this.URLS = URLS;
  }

  $onInit() {
    this.rsva = {};
    this.rsvaForm = {};

    this.links = _.pick(this.URLS, ['transferTable', 'deontology', 'graphicCharter', 'svaToSvaPlus']);
    this.tariffBearingPrice = `${this.costs.rsva.tariffBearing.value} ${(this.costs.rsva.tariffBearing.currencyCode === 'EUR' ? '€' : this.costs.rsva.tariffBearing.currencyCode)}`;

    this.isLoading = true;

    // Initialize bulk datas
    this.bulkData = {
      infos: {
        name: 'rsva',
        actions: [{
          name: 'rsvaUpdate',
          route: '/telephony/{billingAccount}/rsva/{serviceName}',
          method: 'PUT',
          params: null,
        }, {
          name: 'scheduleRateCode',
          route: '/telephony/{billingAccount}/rsva/{serviceName}/scheduleRateCode',
          method: 'POST',
          params: null,
        }],
      },
    };

    return this.$q.all([
      this.OvhApiTelephony.Rsva().v6().getCurrentRateCode({
        billingAccount: this.billingAccount,
        serviceName: this.serviceName,
      }).$promise.then((rateCodeInfos) => {
        this.rateCodeInfos = rateCodeInfos;
        return this.OvhApiTelephony.Rsva().v6().getAllowedRateCodes({
          billingAccount: this.billingAccount,
          serviceName: this.serviceName,
        }).$promise.then((allowedRateCodes) => {
          this.allowedRateCodes = allowedRateCodes;
          this.rsva.rateCode = _.find(this.allowedRateCodes, { code: _.get(rateCodeInfos, 'rateCode') });
          this.rsvaForm.rateCode = this.rsva.rateCode;
        });
      }),

      this.OvhApiTelephony.Rsva().v6().getScheduledRateCode({
        billingAccount: this.billingAccount,
        serviceName: this.serviceName,
      }).$promise.then((scheduledRateCode) => {
        if (scheduledRateCode) {
          this.scheduledRateCode = scheduledRateCode;
          this.formattedEffectiveDatetime = this.$filter('date')(this.scheduledRateCode.effectiveDatetime, 'dd/MM/yyyy');
          this.formattedCancelLimitDatetime = this.$filter('date')(this.scheduledRateCode.cancelLimitDatetime, 'dd/MM/yyyy');
          this.tariffBearingPrice = this.scheduledRateCode.updateRateCodePriceWithoutTax.value
            ? this.scheduledRateCode.updateRateCodePriceWithoutTax.text : this.tariffBearingPrice;
        }
      }).catch(() => false),

      this.OvhApiTelephonyService.v6().directory({
        billingAccount: this.billingAccount,
        serviceName: this.serviceName,
      }).$promise.then((result) => {
        this.rsvaInfos = _.pick(result, ['siret', 'email']);
        return this.OvhApiTelephony.Rsva().v6().get({
          billingAccount: this.billingAccount,
          serviceName: this.serviceName,
        }).$promise.then(details => this.OvhApiOrder.v6().schema().$promise.then((schema) => {
          if (_.has(schema, 'models[\'telephony.NumberSpecialTypologyEnum\'].enum')) {
            const regExp = new RegExp(`^${result.country}_`);
            this.typologies = _.map(
              _.filter(schema.models['telephony.NumberSpecialTypologyEnum'].enum, elt => elt.match(regExp)),
              typo => ({
                value: typo,
                label: `${this.$translate.instant(`telephony_alias_special_rsva_infos_typology_${typo.replace(regExp, '')}_label`)}`,
              }),
            );

            this.rsva.typology = _.find(this.typologies, { value: `${result.country}_${details.typology.replace(result.country, '')}` });
            this.rsvaForm.typology = this.rsva.typology;
          }
        }));
      }),
    ]).catch((err) => {
      this.TucToast.error([this.$translate.instant('telephony_alias_special_rsva_loading_error'), err.message].join(' '));
      return this.$q.reject(err);
    }).finally(() => {
      this.isLoading = false;
    });
  }

  additionalInfos(rateCode) {
    const decimalPrecision = 5;
    if (rateCode.pricePerCallWithoutTax.value) {
      return `(${_.padRight(rateCode.pricePerCallWithoutTax.value, decimalPrecision, 0)}€${this.$translate.instant('telephony_alias_special_rsva_tariff_bearing_per_call')})`;
    }

    if (rateCode.pricePerMinuteWithoutTax.value) {
      return `(${_.padRight(rateCode.pricePerMinuteWithoutTax.value, decimalPrecision, 0)}€${this.$translate.instant('telephony_alias_special_rsva_tariff_bearing_per_minute')})`;
    }
    return '';
  }

  onChangeTariffBearing() {
    this.rateCodeChanged = !angular.equals(this.rsva.rateCode, this.rsvaForm.rateCode);
    return this.rateCodeChanged;
  }

  hasChanges() {
    return (this.rateCodeChanged && this.tariffBearingChangeAgreed)
    || !angular.equals(this.rsva.typology, this.rsvaForm.typology);
  }

  updateRateCode() {
    return this.OvhApiTelephony.Rsva().v6().scheduleRateCode({
      billingAccount: this.billingAccount,
      serviceName: this.serviceName,
    }, { rateCode: _.get(this.rsvaForm, 'rateCode.code', '') }).$promise.then(() => {
      this.rsva = angular.copy(this.rsvaForm);
      this.isEditing = false;
    });
  }

  updateTypology() {
    return this.OvhApiTelephony.Rsva().v6().edit({
      billingAccount: this.billingAccount,
      serviceName: this.serviceName,
    }, { typology: this.rsvaForm.typology.value.replace('fr_', '') }).$promise;
  }

  applyChanges() {
    const promises = [];
    this.isUpdating = true;

    if (this.rateCodeChanged && this.tariffBearingChangeAgreed) {
      promises.push(this.updateRateCode());
    }

    promises.push(this.updateTypology());

    return this.$q.allSettled(promises).then(() => {
      this.TucToast.success(this.$translate.instant('telephony_alias_special_rsva_success'));
    }).then(() => {
      this.isEditing = false;
    }).catch((err) => {
      this.TucToast.error([this.$translate.instant('telephony_alias_special_rsva_error'), err.message].join(' '));
      return this.$q.reject(err);
    })
      .finally(() => {
        this.isUpdating = false;
      });
  }

  cancelEdition() {
    this.isEditing = false;
    this.rsvaForm.rateCode = this.rsva.rateCode;
    this.rsvaForm.typology = this.rsva.typology;
    this.rateCodeChanged = false;
  }

  /* =====================================
  =                  BULK                =
  ====================================== */

  filterServices() {
    return services => this.$q.allSettled(_.map(services,
      service => this.OvhApiTelephony.Rsva().v6().getCurrentRateCode({
        billingAccount: service.billingAccount,
        serviceName: service.serviceName,
      }).$promise))
      .then(result => result)
      .catch(result => result)
      .then((promises) => {
        const filteredServices = [];
        _.times(promises.length, (index) => {
          if (promises[index].status !== 404 && promises[index].status !== 400) {
            filteredServices.push(services[index]);
          }
        });

        return filteredServices;
      });
  }

  getBulkParams() {
    return (action) => {
      let param;
      if (action === 'scheduleRateCode') {
        param = {
          rateCode: _.get(this.rsvaForm, 'rateCode.code', ''),
        };
      } else {
        param = {
          typology: this.rsvaForm.typology.value.replace('fr_', ''),
        };
      }
      return param;
    };
  }

  onBulkSuccess() {
    return (bulkResult) => {
    // display message of success or error
      this.telephonyBulk.getTucToastInfos(bulkResult, {
        fullSuccess: this.$translate.instant('telephony_alias_special_rsva_bulk_all_success'),
        partialSuccess: this.$translate.instant('telephony_alias_special_rsva_bulk_some_success', {
          count: bulkResult.success.length,
        }),
        error: this.$translate.instant('telephony_alias_special_rsva_bulk_error'),
      }).forEach((toastInfo) => {
        this.TucToast[toastInfo.type](toastInfo.message, {
          hideAfter: null,
        });
      });

      this.OvhApiTelephonyService.v6().resetCache();
      this.OvhApiTelephony.Rsva().v6().resetCache();
      this.$onInit();
    };
  }

  onBulkError() {
    return (error) => {
      this.TucToast.error([this.$translate.instant('telephony_alias_special_rsva_bulk_on_error'), _.get(error, 'msg.data', '')].join(' '));
    };
  }
});
