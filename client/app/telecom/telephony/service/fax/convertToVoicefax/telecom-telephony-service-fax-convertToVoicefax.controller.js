angular.module("managerApp").controller("TelecomTelephonyServiceFaxConvertToVoicefaxCtrl", function ($q, $stateParams, $timeout, $translate, OvhApiOrder, Toast) {
    "use strict";

    var self = this;

    /* ===============================
    =            HELPERS            =
    =============================== */

    function fetchConvertToVoicefaxInformations () {
        return OvhApiOrder.Freefax().v6().query().$promise.then(function (serviceIds) {
            return $q.all(_.map(serviceIds, function (service) {
                return OvhApiOrder.Freefax().v6().get({
                    serviceName: service
                }).$promise.then(function (allowedOptions) {
                    if (_.indexOf(allowedOptions, "convertToVoicefax") >= 0) {
                        return service;
                    }
                    return null;
                }, function () {
                    return $q.when(false);
                });
            })).then(function (services) {
                return $q.all(_.map(_.compact(services), function (service) {
                    return OvhApiOrder.Freefax().v6().getConvertToVoicefax({
                        serviceName: service,
                        billingAccount: $stateParams.billingAccount
                    }).$promise.then(function (informations) {
                        return {
                            service: service,
                            informations: informations
                        };
                    });
                }));
            });
        });
    }

    /* -----  End of HELPERS  ------ */

    /* ===============================
    =            EVENTS            =
    =============================== */

    self.changeNumberToConvert = function () {
        self.convertToVoicefaxForm.isChanging = true;
        return $timeout(angular.noop, 500).finally(function () {
            self.convertToVoicefaxForm.isChanging = false;
        });
    };

    /* -----  End of EVENTS  ------ */

    /* ===============================
    =            ACTIONS            =
    =============================== */

    self.orderConvertToVoicefax = function () {
        self.convertToVoicefaxForm.isOrdering = true;
        return OvhApiOrder.Freefax().v6().orderConvertToVoicefax({
            serviceName: _.get(self.convertToVoicefaxForm, "serviceName.service")
        }, _.pick(self.convertToVoicefaxForm, "billingAccount")).$promise.then(function (order) {
            self.convertToVoicefaxForm.prices = order;
        }).catch(function (err) {
            Toast.error([$translate.instant("telephony_service_fax_convert_to_voicefax_list_error_ordering"), _.get(err, "data.message", "")].join(" "));
        }).finally(function () {
            self.convertToVoicefaxForm.isOrdering = false;
        });
    };

    /* -----  End of ACTIONS  ------ */

    /* ======================================
    =            INITIALIZATION            =
    ====================================== */

    function init () {
        self.isLoading = false;
        self.services = null;
        self.convertToVoicefaxForm = {
            billingAccount: null,
            serviceName: null,
            contracts: false,
            prices: null,
            isChanging: false,
            isOrdering: false
        };

        self.isLoading = true;
        return fetchConvertToVoicefaxInformations().then(function (services) {
            self.services = services;
            self.convertToVoicefaxForm.billingAccount = $stateParams.billingAccount;
            self.convertToVoicefaxForm.serviceName = _.first(self.services);
        }).catch(function (err) {
            Toast.error([$translate.instant("telephony_service_fax_convert_to_voicefax_list_error_loading"), _.get(err, "data.message", "")].join(" "));
        }).finally(function () {
            self.isLoading = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
