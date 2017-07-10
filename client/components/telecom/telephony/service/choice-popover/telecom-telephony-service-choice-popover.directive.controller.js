angular.module("managerApp").controller("voipServiceChoicePopoverCtrl", function ($q, $translate, $translatePartialLoader, TelephonyMediator) {
    "use strict";

    var self = this;

    self.loading = {
        init: false,
        translations: false
    };

    self.filters = {
        types: null,
        groups: []
    };

    self.status = {
        move: false,
        toShow: null
    };

    self.serviceList = [];
    self.selectedService = null;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function setAvailableTypesFilters () {
        if (self.availableTypes && self.availableTypes.length) {
            self.filters.types = _.map(self.availableTypes, function (type) {
                return {
                    value: type,
                    active: false
                };
            });
        } else {
            self.filters.types = [{
                value: "sip",
                active: false
            }, {
                value: "trunk",
                active: false
            }, {
                value: "fax",
                active: false
            }, {
                value: "number",
                active: false
            }];
        }
    }

    function setAvailableGroupsFilters () {
        angular.forEach(TelephonyMediator.groups, function (group) {
            if (_.indexOf(self.hiddenGroups, group.billingAccount) === -1) {
                self.filters.groups.push({
                    value: group.billingAccount,
                    active: false
                });
            }
        });
    }

    /* ----------  DISPLAY HELPERS  ----------*/

    /**
     *  Get group from its bilingAccoung
     */
    self.getGroup = function (billingAccount) {
        return TelephonyMediator.groups[billingAccount] || {};
    };

    /**
     *  Get how a service will be displayed
     */
    self.getServiceDisplayedName = function (service, isGroup) {
        if (isGroup) {
            return service.description && service.description !== service.billingAccount ? service.description + " - " + service.billingAccount : service.billingAccount;
        }
        return service.description && service.description !== service.serviceName ? service.description + " - " + service.serviceName : service.serviceName;

    };

    /**
     *  Get the service type
     */
    self.getServiceType = function (service) {
        if (service.serviceType === "alias") {
            return "number";
        }
        if (!service.isFax && service.isTrunk && service.isTrunk()) {
            return "trunk";
        } else if (service.isFax) {
            return "fax";
        }
        return service.isPlugNFax ? "plug_fax" : "line";


    };

    /**
     *  Get service grouped by name
     */
    self.getServiceGroupName = function (service) {
        return self.getServiceDisplayedName(_.find(TelephonyMediator.groups, {
            billingAccount: service.billingAccount
        }), true);
    };

    /**
     * Filter to exclude services from the list.
     */
    self.excludeFilter = function (service) {
        if (angular.isArray(self.excludeServices)) {
            return self.excludeServices.indexOf(service.serviceName) < 0;
        }
        return true;
    };

    /* ----------  FILTERS  ----------*/

    self.applyFilter = function (service) {
        var hasTypeFilter = _.some(self.filters.types, {
            active: true
        });
        var hasGroupFilter = _.some(self.filters.groups, {
            active: true
        });
        var isFaxActive;
        var isTrunkActive;
        if (!hasTypeFilter && !hasGroupFilter) {
            // if no filter active, do not filter
            return true;
        }
        var applyTypeFilter = false;
        var applyGroupFilter = false;
        if (hasTypeFilter) {
            if (service.serviceType === "alias") {
                applyTypeFilter = _.some(self.filters.types, {
                    value: "number",
                    active: true
                });
            } else {
                isFaxActive = _.some(self.filters.types, {
                    value: "fax",
                    active: true
                });
                isTrunkActive = _.some(self.filters.types, {
                    value: "trunk",
                    active: true
                });
                if (isFaxActive && service.isFax) {
                    applyTypeFilter = true;
                } else if (isTrunkActive && !service.isFax && service.isTrunk()) {
                    applyTypeFilter = true;
                } else {
                    applyTypeFilter = _.some(self.filters.types, {
                        value: "sip",
                        active: true
                    });
                }
            }
            if (!hasGroupFilter) {
                return applyTypeFilter;
            }
        }

        if (hasGroupFilter) {
            applyGroupFilter = _.chain(self.filters.groups).filter({
                active: true
            }).map("value")
                .value()
                .indexOf(service.billingAccount) > -1;

            if (!hasTypeFilter) {
                return applyGroupFilter;
            }
        }

        return applyTypeFilter && applyGroupFilter;

    };

    /* -----  End of HELPERS  ------*/

    /*= =============================
    =            EVENTS            =
    ==============================*/

    self.onValidate = function () {
        // close popover
        self.popoverOptions.popoverIsOpen = false;

        // call callback function
        if (self.onChoiceValidated()) {
            self.onChoiceValidated()(self.selectedService, self.choiceArgs);
            delete self.selectedService; // reset form
        }
    };

    self.onCancel = function () {
        // close popover
        self.popoverOptions.popoverIsOpen = false;

        // call callback function
        if (self.onChoiceCancel()) {
            self.onChoiceCancel()(self.choiceArgs);
        }
    };

    /* -----  End of EVENTS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    /* ----------  Translations load  ----------*/

    function getTranslations () {
        self.loading.translations = true;

        $translatePartialLoader.addPart("../components/telecom/telephony/service/choice-popover");
        return $translate.refresh().finally(function () {
            self.loading.translations = false;
        });
    }

    /* ----------  Component initialization  ----------*/

    self.$onInit = function () {
        self.loading.init = true;

        return $q.all({
            translations: getTranslations(),
            services: TelephonyMediator.getAll()
        }).then(function () {
            // set available types
            setAvailableTypesFilters();

            // setavailable groups
            setAvailableGroupsFilters();

            // set service list
            angular.forEach(self.filters.groups, function (groupParam) {
                var group = self.getGroup(groupParam.value);

                // add sip lines
                if (_.some(self.filters.types, { value: "sip" })) {
                    self.serviceList = self.serviceList.concat(_.filter(group.lines, function (line) {
                        return !line.isTrunk();
                    }));
                }

                // add trunk lines
                if (_.some(self.filters.types, { value: "trunk" })) {
                    self.serviceList = self.serviceList.concat(_.filter(group.lines, function (line) {
                        return line.isTrunk();
                    }));
                }

                // add fax lines
                if (_.some(self.filters.types, { value: "fax" })) {
                    self.serviceList = self.serviceList.concat(_.filter(group.fax, function (fax) {
                        return !fax.isSip && !_.find(group.lines, {
                            serviceName: fax.serviceName
                        });
                    }));
                }

                // add numbers
                if (_.some(self.filters.types, { value: "number" })) {
                    self.serviceList = self.serviceList.concat(group.numbers);
                }
            });

        }).finally(function () {
            self.loading.init = false;
        });
    };

    /* -----  End of INITIALIZATION  ------*/

});
