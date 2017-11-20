angular.module("managerApp").controller("telephonyBulkActionModalCtrl", function ($filter, $translate, $uibModalInstance, modalBindings, telecomVoip) {
    "use strict";

    var self = this;

    self.loading = {
        init: false,
        bulk: false
    };

    self.model = {
        billingAccount: null,
        searchService: "",
        selection: {}
    };

    self.state = {
        selectAll: false
    };

    self.bindings = null;
    self.billingAccounts = null;

    /* ==============================
    =            HELPERS            =
    =============================== */

    function getFilteredServiceList () {
        var services = null;

        if (!self.model.billingAccount) {
            services = telecomVoip.concatServices(self.billingAccounts);
        } else {
            services = _.find(self.billingAccounts, {
                billingAccount: self.model.billingAccount
            }).services;
        }

        services = _.filter(services, {
            serviceType: self.bindings.serviceType
        });

        if (self.model.searchService !== "") {
            return $filter("propsFilter")(services, {
                serviceName: self.model.searchService,
                description: self.model.searchService
            });
        }

        return services;
    }

    self.getSelectedCount = function () {
        var count = 0;

        _.keys(self.model.selection).forEach(function (serviceName) {
            count += _.get(self.model.selection, serviceName) === true ? 1 : 0;
        });

        return count;
    };

    /* -----  End of HELPERS  ------ */


    /* =============================
    =            EVENTS            =
    ============================== */

    self.cancel = function (message) {
        return $uibModalInstance.dismiss(message);
    };

    self.onBillingAccountSelectChange = function () {
        self.state.selectAll = false;
        self.serviceList = getFilteredServiceList();
    };

    self.onToggleAllCheckStateBtnClick = function () {
        self.state.selectAll = !self.state.selectAll;
        self.serviceList.forEach(function (service) {
            if (service.serviceName !== self.bindings.serviceName) {
                _.set(self.model.selection, service.serviceName, self.state.selectAll);
            }
        });
    };

    self.onSearchServiceInputChange = function () {
        self.state.selectAll = false;
        self.serviceList = getFilteredServiceList();
    };

    /* -----  End of EVENTS  ------ */

    /* =====================================
    =            INITIALIZATION            =
    ====================================== */

    self.$onInit = function () {
        self.loading.init = true;

        self.bindings = modalBindings;
        self.model.billingAccount = self.bindings.billingAccount;

        return telecomVoip.fetchAll(false).then(function (billingAccounts) {
            self.billingAccounts = _.sortBy(billingAccounts, function (billingAccount) {
                return billingAccount.getDisplayedName();
            });
            self.serviceList = getFilteredServiceList();
            console.log(self.serviceList);

            // set current serviceName as selected
            _.set(self.model.selection, self.bindings.serviceName, true);
        }).finally(function () {
            self.loading.init = false;
        });
    };

    /* -----  End of INITIALIZATION  ------ */

});
