angular.module("managerApp").controller("TelecomTelephonyServiceFaxCustomDomainsCtrl", function ($filter, $q, $stateParams, $timeout, $translate, OvhApiDomain, TelephonyMediator, Toast, OvhApiMe) {
    "use strict";

    var self = this;

    /* ===============================
    =            HELPERS            =
    =============================== */

    function fetchDomains () {
        return OvhApiDomain.v7().query().execute().$promise;
    }

    function fetchCustomDomains () {
        return OvhApiMe.Fax().CustomDomains().v6().query().$promise.then(function (customDomainsIds) {
            return $q.all(_.map(customDomainsIds, function (id) {
                return OvhApiMe.Fax().CustomDomains().v6().get({
                    id: id
                }).$promise;
            }));
        });
    }

    /* -----  End of HELPERS  ------ */

    /* ===============================
    =            ACTIONS            =
    =============================== */

    self.sortCustomDomains = function () {
        var data = angular.copy(self.customDomains.raw);
        data = $filter("orderBy")(
            data,
            self.customDomains.orderBy,
            self.customDomains.orderDesc
        );
        self.customDomains.sorted = data;
    };

    self.addCustomDomains = function (form) {
        self.addCustomDomainsForm.isAdding = true;
        return OvhApiMe.Fax().CustomDomains().v6().create(
            {}, _.pick(self.addCustomDomainsForm, "domain")
        ).$promise.then(function () {
            form.$setPristine();
            self.addCustomDomainsForm.domain = null;
            Toast.success($translate.instant("telephony_service_fax_custom_domains_configuration_form_add_success"));
            return self.refresh();
        }).catch(function (err) {
            Toast.error([$translate.instant("telephony_service_fax_custom_domains_configuration_form_add_error"), _.get(err, "data.message", "")].join(" "));
        }).finally(function () {
            self.addCustomDomainsForm.isAdding = false;
        });
    };

    self.cancelCustomDomains = function (form) {
        form.$setPristine();
        self.addCustomDomainsForm.domain = null;
    };

    self.removeCustomDomains = function (domain) {
        domain.isDeleting = true;
        return $q.all([
            OvhApiMe.Fax().CustomDomains().v6().remove({
                id: _.get(domain, "id")
            }).$promise,
            $timeout(angular.noop, 500)
        ]).then(function () {
            Toast.success($translate.instant("telephony_service_fax_custom_domains_configuration_form_remove_success"));
            return self.refresh();
        }).catch(function (err) {
            Toast.error([$translate.instant("telephony_service_fax_custom_domains_configuration_form_remove_error"), _.get(err, "data.message", "")].join(" "));
        }).finally(function () {
            domain.isDeleting = false;
        });
    };

    self.refresh = function () {
        self.customDomains.isLoading = true;
        return $q.all({
            domains: fetchDomains(),
            customDomains: fetchCustomDomains()
        }).then(function (result) {
            self.domains = result.domains;
            self.customDomains.raw = result.customDomains;
            self.sortCustomDomains();
        }).catch(function (err) {
            Toast.error([$translate.instant("telephony_service_fax_custom_domains_error_loading"), _.get(err, "data.message", "")].join(" "));
        }).finally(function () {
            self.customDomains.isLoading = false;
        });
    };

    /* -----  End of ACTIONS  ------ */

    /* ======================================
    =            INITIALIZATION            =
    ====================================== */

    function init () {
        self.loading = {
            init: false
        };
        self.fax = null;
        self.domains = null;
        self.customDomains = {
            raw: [],
            paginated: null,
            sorted: null,
            orderBy: "domain",
            orderDesc: false,
            isLoading: false
        };
        self.addCustomDomainsForm = {
            domain: null,
            isAdding: false
        };
        self.loading.init = true;
        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.fax = group.getFax($stateParams.serviceName);
            return self.refresh();
        }).catch(function (err) {
            Toast.error([$translate.instant("telephony_service_fax_custom_domains_error_loading"), _.get(err, "data.message", "")].join(" "));
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
