angular.module("managerApp").service("TelephonySidebar", function ($translate, SidebarMenu, telecomVoip, voipService) {
    "use strict";

    var self = this;
    self.mainSectionItem = null;

    function addServiceMenuItems (services, options, billingAccountSubSection) {
        services.forEach(function (service) {
            SidebarMenu.addMenuItem({
                id: service.serviceName,
                title: service.getDisplayedName(),
                state: options.state,
                stateParams: {
                    billingAccount: service.billingAccount,
                    serviceName: service.serviceName
                },
                prefix: options.prefix && angular.isFunction(options.prefix) ? options.prefix(service) : options.prefix
            }, billingAccountSubSection);
        });
    }

    /*
     * Telephony sidebar initilization
     */
    self.initTelephonySubsection = function () {

        return telecomVoip.fetchAll().then(function (billingAccounts) {

            /* ----------  billingAccount display  ---------- */

            // first sort by getDisplayedName
            let sortedBillingAccounts = billingAccounts.sort(function (first, second) {
                return first.getDisplayedName().localeCompare(second.getDisplayedName());
            });

            // add billingAccount subsections to telephony sidebar menu item
            sortedBillingAccounts.forEach(function (billingAccount) {
                // create subsection object
                let billingAccountSubSection = SidebarMenu.addMenuItem({
                    id: billingAccount.billingAccount,
                    title: billingAccount.getDisplayedName(),
                    state: "telecom.telephony",
                    stateParams: {
                        billingAccount: billingAccount.billingAccount
                    },
                    allowSubItems: billingAccount.services.length > 0
                }, self.mainSectionItem);

                /* ----------  Numbers (alias) display  ---------- */

                // first sort numbers of the billingAccount
                let sortedAlias = voipService.sortServicesByDisplayedName(billingAccount.getAlias());

                // add number subsections to billingAccount subsection
                addServiceMenuItems(sortedAlias, {
                    state: "telecom.telephony.alias",
                    prefix: $translate.instant("telecom_sidebar_section_telephony_number")
                }, billingAccountSubSection);

                /* ----------  Lines display  ---------- */

                // first sort lines of the billingAccount
                let sortedLines = voipService.sortServicesByDisplayedName(billingAccount.getLines());

                // display lines except plugAndFax and fax
                let sortedSipLines = _.filter(sortedLines, function (line) {
                    return line.featureType !== "plugAndFax" && line.featureType !== "fax";
                });

                // add line subsections to billingAccount subsection
                let sipTrunkPrefix = $translate.instant("telecom_sidebar_section_telephony_trunk");
                let sipPrefix = $translate.instant("telecom_sidebar_section_telephony_line");

                addServiceMenuItems(sortedSipLines, {
                    state: "telecom.telephony.line",
                    prefix: function (lineService) {
                        return lineService.isSipTrunk() ? sipTrunkPrefix : sipPrefix;
                    }
                }, billingAccountSubSection);

                // second get plugAndFax
                let sortedPlugAndFaxLines = voipService.filterPlugAndFaxServices(sortedLines);

                // add plugAndFax subsections to billingAccount subsection
                addServiceMenuItems(sortedPlugAndFaxLines, {
                    state: "telecom.telephony.line",
                    prefix: $translate.instant("telecom_sidebar_section_telephony_plug_fax")
                }, billingAccountSubSection);

                // then get fax
                let sortedFaxLines = voipService.filterFaxServices(sortedLines);

                // add fax subsections to billingAccount subsection
                addServiceMenuItems(sortedFaxLines, {
                    state: "telecom.telephony.fax",
                    prefix: $translate.instant("telecom_sidebar_section_telephony_fax")
                }, billingAccountSubSection);
            });
        });
    };

    self.init = function () {
        self.mainSectionItem = SidebarMenu.addMenuItem({
            title: $translate.instant("telecom_sidebar_section_telephony"),
            error: $translate.instant("telecom_sidebar_load_error"),
            id: "telecom-telephony-section",
            category: "telephony",
            icon: "ovh-font ovh-font-phone",
            allowSubItems: true,
            onLoad: self.initTelephonySubsection,
            loadOnState: "telecom.telephony",
            allowSearch: true,
            infiniteScroll: true
        });

        return self.mainSectionItem;
    };
});
