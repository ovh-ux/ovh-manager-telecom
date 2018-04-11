angular.module("managerApp").service("OverTheBoxSidebar", function ($q, $translate, SidebarMenu, OvhApiOverTheBox) {
    "use strict";

    var self = this;

    self.mainSectionItem = null;

    /*= =======================================
    =            SUBITEMS LOADING            =
    ========================================*/

    self.loadOtbMainSection = function () {
        var requests = [];

        return OvhApiOverTheBox.v6().query().$promise.then(function (serviceNames) {
            requests = _.map(serviceNames, function (serviceName) {
                return OvhApiOverTheBox.v6().get({
                    serviceName: serviceName
                }).$promise;
            });

            return $q.all(requests).then(function (overTheBoxDetails) {
                _.forEach(overTheBoxDetails, function (overTheBoxDetail) {
                    SidebarMenu.addMenuItem({
                        title: overTheBoxDetail.customerDescription || overTheBoxDetail.serviceName,
                        id: overTheBoxDetail.serviceName,
                        state: "telecom.overTheBox.details",
                        stateParams: {
                            serviceName: overTheBoxDetail.serviceName
                        }
                    }, self.mainSectionItem);
                });
            });
        });
    };

    /* -----  End of SUBITEMS LOADING  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    self.init = function () {
        self.mainSectionItem = SidebarMenu.addMenuItem({
            title: $translate.instant("telecom_sidebar_section_otb"),
            error: $translate.instant("telecom_sidebar_load_error"),
            id: "telecom-otb-section",
            category: "overTheBox",
            icon: "ovh-font ovh-font-overTheBox",
            allowSubItems: true,
            onLoad: self.loadOtbMainSection,
            loadOnState: "telecom.overTheBox"
        });

        return self.mainSectionItem;
    };

    /* -----  End of INITIALIZATION  ------*/

});
