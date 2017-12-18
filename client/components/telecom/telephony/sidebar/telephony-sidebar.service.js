angular.module("managerApp").service("TelephonySidebar", function ($translate, SidebarMenu, telecomVoip, voipService) {
    "use strict";

    var self = this;
    self.mainSectionItem = null;

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
                let sortedAlias = billingAccount.getAlias().sort(function (first, second) {
                    return first.getDisplayedName().localeCompare(second.getDisplayedName());
                });

                // add number subsections to billingAccount subsection
                sortedAlias.forEach(function (aliasService) {
                    SidebarMenu.addMenuItem({
                        id: aliasService.serviceName,
                        title: aliasService.getDisplayedName(),
                        state: "telecom.telephony.alias",
                        stateParams: {
                            billingAccount: aliasService.billingAccount,
                            serviceName: aliasService.serviceName
                        },
                        prefix: $translate.instant("telecom_sidebar_section_telephony_number")
                    }, billingAccountSubSection);
                });

                /* ----------  Lines display  ---------- */

                // first sort lines of the billingAccount
                let sortedLines = billingAccount.getLines().sort(function (first, second) {
                    return first.getDisplayedName().localeCompare(second.getDisplayedName());
                });

                // display lines except plugAndFax and fax
                let sortedSipLines = _.filter(sortedLines, function (line) {
                    return line.featureType !== "plugAndFax" && line.featureType !== "fax";
                });

                // add line subsections to billingAccount subsection
                sortedSipLines.forEach(function (lineService) {
                    SidebarMenu.addMenuItem({
                        id: lineService.serviceName,
                        title: lineService.getDisplayedName(),
                        state: "telecom.telephony.line",
                        stateParams: {
                            billingAccount: lineService.billingAccount,
                            serviceName: lineService.serviceName
                        },
                        prefix: lineService.isSipTrunk() ? $translate.instant("telecom_sidebar_section_telephony_trunk") : $translate.instant("telecom_sidebar_section_telephony_line")
                    }, billingAccountSubSection);
                });

                // second get plugAndFax
                let sortedPlugAndFaxLines = voipService.filterPlugAndFaxServices(sortedLines);

                // add plugAndFax subsections to billingAccount subsection
                sortedPlugAndFaxLines.forEach(function (plugAndFaxService) {
                    SidebarMenu.addMenuItem({
                        id: plugAndFaxService.serviceName,
                        title: plugAndFaxService.getDisplayedName(),
                        state: "telecom.telephony.line",
                        stateParams: {
                            billingAccount: plugAndFaxService.billingAccount,
                            serviceName: plugAndFaxService.serviceName
                        },
                        prefix: $translate.instant("telecom_sidebar_section_telephony_plug_fax")
                    }, billingAccountSubSection);
                });

                // then get fax
                let sortedFaxLines = voipService.filterFaxServices(sortedLines);

                // add fax subsections to billingAccount subsection
                sortedFaxLines.forEach(function (faxService) {
                    SidebarMenu.addMenuItem({
                        id: faxService.serviceName,
                        title: faxService.getDisplayedName(),
                        state: "telecom.telephony.fax",
                        stateParams: {
                            billingAccount: faxService.billingAccount,
                            serviceName: faxService.serviceName
                        },
                        prefix: $translate.instant("telecom_sidebar_section_telephony_fax")
                    }, billingAccountSubSection);
                });

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
