angular.module("managerApp").service("FaxSidebar", function ($translate, SidebarMenu, OvhApiTelephonyFax) {
    "use strict";

    var self = this;

    self.mainSectionItem = null;

    /*= =======================================
    =            SUBITEMS LOADING            =
    ========================================*/

    self.loadFaxMainSection = function () {
        return OvhApiTelephonyFax.Aapi().getServices().$promise.then(function (faxList) {
            var filteredFax = _.filter(
                faxList,
                {
                    type: "FREEFAX"
                }
            );
            _.forEach(
                filteredFax,
                function (elt) {
                    elt.name = elt.label || elt.serviceName;
                }
            );
            angular.forEach(_.sortBy(filteredFax, "name"), function (fax) {
                SidebarMenu.addMenuItem({
                    title: fax.label,
                    prefix: $translate.instant("telecom_sidebar_fax_prefix_freefax"),
                    state: "telecom.freefax",
                    stateParams: {
                        serviceName: fax.serviceName
                    }
                }, self.mainSectionItem);
            });
        });
    };

    /* -----  End of SUBITEMS LOADING  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    self.init = function () {
        self.mainSectionItem = SidebarMenu.addMenuItem({
            title: $translate.instant("telecom_sidebar_section_fax"),
            error: $translate.instant("telecom_sidebar_load_error"),
            category: "freefax",
            icon: "ovh-font ovh-font-print",
            allowSubItems: true,
            onLoad: self.loadFaxMainSection,
            loadOnState: "telecom.freefax"
        });

        return self.mainSectionItem;
    };

    /* -----  End of INITIALIZATION  ------*/

});
