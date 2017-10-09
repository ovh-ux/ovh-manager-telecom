angular.module("managerApp").service("TelephonySidebar", function ($q, $translate, SidebarMenu, OvhApiTelephony, TelephonyMediator) {
    "use strict";

    var self = this;
    self.mainSectionItem = null;

    /*
     * Telephony sidebar initilization
     */
    self.initTelephonySubsection = function () {

        // fetch all telephony services and groups
        return TelephonyMediator.getAll().then(function (groups) {

            // GROUPS
            var sortedGroups = (_.values(groups) || []).sort(function (first, second) {
                return first.getDisplayedName().localeCompare(second.getDisplayedName());
            });
            _.forEach(sortedGroups, function (group) {

                var subSection = SidebarMenu.addMenuItem({
                    id: group.billingAccount,
                    title: group.getDisplayedName(),
                    state: "telecom.telephony",
                    stateParams: {
                        billingAccount: group.billingAccount
                    },
                    allowSubItems: group.lines.length + group.numbers.length + group.fax.length > 0
                }, self.mainSectionItem);

                // NUMBERS
                var sortedNumbers = (group.numbers || []).sort(function (first, second) {
                    return first.getDisplayedName().localeCompare(second.getDisplayedName());
                });
                _.forEach(sortedNumbers, function (number) {
                    SidebarMenu.addMenuItem({
                        id: number.serviceName,
                        title: number.getDisplayedName(),
                        state: "telecom.telephony.alias",
                        stateParams: {
                            billingAccount: number.billingAccount,
                            serviceName: number.serviceName
                        },
                        prefix: $translate.instant("telecom_sidebar_section_telephony_number")
                    }, subSection);
                });

                // LINES
                var sortedLines = (group.lines || []).sort(function (first, second) {
                    if (first.isPlugNFax) {
                        return second.isPlugNFax ? first.getDisplayedName().localeCompare(second.getDisplayedName()) : 1;
                    }
                    return second.isPlugNFax ? -1 : first.getDisplayedName().localeCompare(second.getDisplayedName());
                });
                var prefix;
                _.forEach(sortedLines, function (line) {
                    prefix = $translate.instant("telecom_sidebar_section_telephony_line");
                    if (line.isPlugNFax) {
                        prefix = $translate.instant("telecom_sidebar_section_telephony_plug_fax");
                    } else if (line.isTrunk()) {
                        prefix = $translate.instant("telecom_sidebar_section_telephony_trunk");
                    }
                    SidebarMenu.addMenuItem({
                        id: line.serviceName,
                        title: line.getDisplayedName(),
                        state: "telecom.telephony.line",
                        stateParams: {
                            billingAccount: line.billingAccount,
                            serviceName: line.serviceName
                        },
                        prefix: prefix
                    }, subSection);
                });

                // FAX
                var sortedFax = (group.fax || []).sort(function (first, second) {
                    return first.getDisplayedName().localeCompare(second.getDisplayedName());
                });
                _.forEach(sortedFax, function (fax) {
                    SidebarMenu.addMenuItem({
                        id: fax.serviceName,
                        title: fax.getDisplayedName(),
                        state: "telecom.telephony.fax",
                        stateParams: {
                            billingAccount: fax.billingAccount,
                            serviceName: fax.serviceName
                        },
                        prefix: $translate.instant("telecom_sidebar_section_telephony_fax")
                    }, subSection);
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
            icon: "phone",
            allowSubItems: true,
            onLoad: self.initTelephonySubsection,
            loadOnState: "telecom.telephony",
            allowSearch: true,
            infiniteScroll: true
        });

        return self.mainSectionItem;
    };
});
