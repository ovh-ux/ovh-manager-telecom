angular.module("managerApp").service("TelephonySidebar", function ($q, $translate, $timeout, SidebarMenu, TelephonyMediator, Toast, ToastError) {
    "use strict";

    var self = this;

    self.mainSectionItem = null;
    self.currentPage = 0;
    self.itemsPerPage = 30; // @TODO 50 items per page when apiv7 available for /telepony
    self.currentSearch = null;

    /*= ====================================
    =            FILL SECTIONS            =
    =====================================*/

    function fillTelephonyNumbersSubSection (numbers, subSection) {
        var sortedNumbers = (numbers || []).sort(function (first, second) {
            return first.getDisplayedName().localeCompare(second.getDisplayedName());
        });
        angular.forEach(sortedNumbers, function (number) {
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
    }

    function fillTelephonyLinesSubSection (lines, subSection) {
        var sortedLines = (lines || []).sort(function (first, second) {
            if (first.isPlugNFax) {
                return second.isPlugNFax ? first.getDisplayedName().localeCompare(second.getDisplayedName()) : 1;
            }
            return second.isPlugNFax ? -1 : first.getDisplayedName().localeCompare(second.getDisplayedName());

        });
        angular.forEach(sortedLines, function (line) {
            SidebarMenu.addMenuItem({
                id: line.serviceName,
                title: line.getDisplayedName(),
                state: "telecom.telephony.line",
                stateParams: {
                    billingAccount: line.billingAccount,
                    serviceName: line.serviceName
                },
                prefix: line.isPlugNFax ? $translate.instant("telecom_sidebar_section_telephony_plug_fax") :
                    $translate.instant("telecom_sidebar_section_telephony_line")
            }, subSection);
        });
    }

    function fillTelephonyFaxSubSection (faxListParam, lines, subSection) {

        var faxList = _.filter(faxListParam || [], { isSip: false });

        // to avoid having duplicates of lines in sidebar, don't add fax
        // if the line already exists, fax will be accessible from a tab
        faxList = _.filter(faxList || [], function (fax) {
            return !_.find(lines, { serviceName: fax.serviceName });
        });

        faxList.sort(function (first, second) {
            return first.getDisplayedName().localeCompare(second.getDisplayedName());
        });

        angular.forEach(faxList, function (fax) {
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
    }

    function fillGroupSubsections (group, subSection) {
        fillTelephonyNumbersSubSection(group.numbers, subSection);
        fillTelephonyLinesSubSection(group.lines, subSection);
        fillTelephonyFaxSubSection(group.fax, group.lines, subSection);
    }

    function getGroupItemMenuOptions (group) {
        return {
            id: group.billingAccount,
            title: group.getDisplayedName(),
            state: "telecom.telephony",
            stateParams: {
                billingAccount: group.billingAccount
            },
            allowSubItems: group.numbers.length > 0 || group.lines.length > 0 || group.fax.length > 0
        };
    }

    /* -----  End of FILL SECTIONS  ------*/

    /*= =================================
    =            DATAS LOAD            =
    ==================================*/

    self.fetchData = function () {
        var groups = [];
        var hasMore = false;
        var previousPage = self.currentPage;

        return TelephonyMediator.fetchGroups(self.currentPage * self.itemsPerPage, self.itemsPerPage, self.currentSearch).then(function (result) {
            self.currentPage += 1;
            groups = result;
            return result.length === 0 ? [] : TelephonyMediator.fetchGroups(self.currentPage * self.itemsPerPage, self.itemsPerPage, self.currentSearch);
        }).then(function (result) {
            hasMore = result.length > 0;
        }).then(function () {
            angular.forEach(groups, function (group) {
                var subSection = SidebarMenu.addMenuItem(getGroupItemMenuOptions(group), self.mainSectionItem);
                fillGroupSubsections(group, subSection);
            });
            self.mainSectionItem.viewMore.enabled = hasMore;
        })
            .catch(function (error) {
                self.currentPage = previousPage; // page load failed, reset page index
                return $q.reject(error);
            });

    };

    /* -----  End of DATAS LOAD  ------*/

    /**
     * Reset Telephony sidebar contents and reload data.
     */
    self.reset = function () {
        if (self.mainSectionItem) {
            self.mainSectionItem.clearSubItems();
            self.mainSectionItem.loading = true;
            self.currentPage = 0;
            self.currentSearch = 0;
            self.mainSectionItem.viewMore.enabled = false;
            return self.fetchData().then(function () {
                return SidebarMenu.manageStateChange();
            }).finally(function () {
                self.mainSectionItem.loading = false;
            });
        }
        return $q.when(true);
    };

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    self.init = function () {

        self.mainSectionItem = SidebarMenu.addMenuItem({
            title: $translate.instant("telecom_sidebar_section_telephony"),
            error: $translate.instant("telecom_sidebar_load_error"),
            id: "telecom-telephony-section",
            category: "telephony",
            icon: "phone",
            allowSubItems: true,
            onLoad: self.fetchData,
            loadOnState: "telecom.telephony",

            // allowSearch: true, // @TODO change when api v7 available for /telephony
            allowSearch: false,
            onSearch: function (search) {
                self.currentPage = 0; // reset current page
                self.currentSearch = search;
                return self.fetchData().catch(function (error) {
                    return new ToastError(error);
                });
            }
        });

        self.mainSectionItem.viewMore = {
            title: $translate.instant("telecom_sidebar_view_more"),
            loading: false,
            enabled: true,
            action: function () {
                self.mainSectionItem.viewMore.loading = true;
                return self.fetchData().catch(function (error) {
                    return new ToastError(error);
                }).finally(function () {
                    self.mainSectionItem.viewMore.loading = false;
                });
            }
        };

        return self.mainSectionItem;
    };

    /* -----  End of INITIALIZATION  ------*/

});
