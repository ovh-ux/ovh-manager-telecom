angular.module("managerApp").service("PackSidebar", function ($q, $translate, SidebarMenu, PackMediator) {
    "use strict";

    var self = this;
    var accessErrorStates = ["cancelled", "close", "deleting", "slamming"];

    self.mainSectionItem = null;
    self.allPacks = [];

    /*= =================================
    =       SIDEBAR ITEM CREATION      =
    ==================================*/

    function getPackStatus (pack) {
        var isAllAccessInError = pack.xdsl.length && _.every(pack.xdsl, function (xdsl) {
            return accessErrorStates.indexOf(xdsl.status) > -1;
        });
        if (isAllAccessInError) {
            return $q.when("error");
        }

        var hasLine = _.find(pack.xdsl, function (xdsl) {
            return !!xdsl.line;
        });
        if (!hasLine) {
            return PackMediator.getPackStatus(pack.packName).then(function (status) {
                return status === "inCreation" ? "inCreation" : "error";
            });
        }

        return $q.when(_.find(pack.xdsl, function (xdsl) {
            return accessErrorStates.indexOf(xdsl.status) > -1;
        }) ? "warning" : "ok");
    }

    // add pack xdsl to sidebar
    function fillPacks (packList) {
        angular.forEach(packList, function (pack) {
            var hasLine = _.find(pack.xdsl, function (xdsl) {
                return xdsl.line;
            });

            getPackStatus(pack).then(function (packStatus) {

                var packSection = SidebarMenu.addMenuItem({
                    id: pack.packName,
                    title: pack.description || pack.packName,
                    prefix: $translate.instant("back_my_pack"),
                    state: "telecom.pack",
                    stateParams: {
                        packName: pack.packName
                    },
                    allowSubItems: hasLine,
                    icon: packStatus === "error" ? "failure" : packStatus === "warning" ? "warning" : packStatus === "inCreation" ? "inprogress" : "success",
                    iconClass: packStatus === "error" ? "text-danger" : packStatus === "warning" ? "text-warning" : null
                }, self.mainSectionItem);

                if (hasLine) {
                    // for each pack add line sub section
                    angular.forEach(pack.xdsl, function (xdsl) {
                        if (xdsl.line) {
                            var elt = SidebarMenu.addMenuItem({
                                id: xdsl.accessName,
                                title: xdsl.description || xdsl.accessName,
                                prefix: _.capitalize(xdsl.accessType),
                                state: "telecom.pack.xdsl",
                                stateParams: {
                                    packName: pack.packName,
                                    serviceName: xdsl.accessName,
                                    number: xdsl.line.number
                                },
                                allowSubItems: false,
                                icon: accessErrorStates.indexOf(xdsl.status) > -1 ? "failure" : "success",
                                iconClass: accessErrorStates.indexOf(xdsl.status) > -1 ? "text-danger" : null
                            }, packSection);

                            elt.addSearchKey(xdsl.line.number);
                            elt.addSearchKey(xdsl.line.originalNumber);

                            if (xdsl.address && xdsl.address.city) {
                                elt.addSearchKey(xdsl.address.city);
                            }
                            if (xdsl.address && xdsl.address.street) {
                                elt.addSearchKey(xdsl.address.street);
                            }
                            if (xdsl.address && xdsl.address.lastName) {
                                elt.addSearchKey(xdsl.address.lastName);
                            }
                            if (xdsl.address && xdsl.address.zipCode) {
                                elt.addSearchKey(xdsl.address.zipCode);
                            }
                        }
                    });
                }
            });
        });
    }

    /**
     *  At time to display xdsl access (sdsl, adsl, vdsl) that are not linked to a pack, we assume that we have fetched all packs.
     *  So we are able to filter xdsl access that are not linked to any pack and then add them to sidebar menu.
     */
    function fillXdsl (xdslListParam) {

        var xdslList = _.filter(xdslListParam, function (xdslAccess) {
            return !_.find(self.allPacks, function (xdslPack) {
                return _.find(xdslPack.xdsl, {
                    accessName: xdslAccess.accessName
                });
            });
        });

        angular.forEach(xdslList, function (xdsl) {
            var xdslSection = SidebarMenu.addMenuItem({
                id: xdsl.accessName,
                title: xdsl.description || xdsl.accessName,
                prefix: _.capitalize(xdsl.accessType),
                loadOnState: "telecom.pack.xdsl",
                loadOnStateParams: {
                    packName: xdsl.accessType,
                    serviceName: xdsl.accessName
                },
                allowSubItems: xdsl.lines.length > 0,
                icon: accessErrorStates.indexOf(xdsl.status) > -1 ? "failure" : "success",
                iconClass: accessErrorStates.indexOf(xdsl.status) > -1 ? "text-danger" : null
            }, self.mainSectionItem);

            // for each sdsl add line subsection
            angular.forEach(xdsl.lines, function (line) {
                var elt = SidebarMenu.addMenuItem({
                    id: line.number,
                    title: line.number,
                    state: "telecom.pack.xdsl",
                    stateParams: {
                        packName: xdsl.accessType,
                        serviceName: xdsl.accessName,
                        number: line.number
                    },
                    allowSubItems: false,
                    icon: accessErrorStates.indexOf(xdsl.status) > -1 ? "failure" : "success",
                    iconClass: accessErrorStates.indexOf(xdsl.status) > -1 ? "text-danger" : null
                }, xdslSection);

                elt.addSearchKey(line.number);
                elt.addSearchKey(line.originalNumber);
            });
        });
    }

    /*= =================================
    =            DATA FETCHING         =
    ==================================*/

    /**
     * We are fetching two types of data : xdsl packs & sdls access.
     *
     * Since we are paginating results, and we want packs to be displayed first,
     * we have to do some tricks to get this behavior.
     *
     * First we fetch packs with current pagination settings, and we check if we
     * have more results. If there are no more packs we can then reset pagination
     * and start to fetch sdsl items.
     *
     * Once we have no more sdsl items it's done.
     */
    self.fetchData = function () {

        var packList = [];
        var sdslList = [];
        var adslList = [];
        var vdslList = [];

        return PackMediator.fetchPacks().then(function (result) {
            packList = result;
            self.allPacks = self.allPacks.concat(packList);
        }).then(function () {
            return PackMediator.fetchXdsl("sdsl").then(function (result) {
                sdslList = result;
            });
        }).then(function () {
            return PackMediator.fetchXdsl("adsl").then(function (result) {
                adslList = result;
            });
        }).then(function () {
            return PackMediator.fetchXdsl("vdsl").then(function (result) {
                vdslList = result;
            });
        }).then(function () {
            fillPacks(packList); // update packs in sidebar
            fillXdsl(sdslList.concat(adslList, vdslList)); // update xdsl in sidebar
        });
    };

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    self.init = function () {

        self.mainSectionItem = SidebarMenu.addMenuItem({
            id: "telecom-pack-section",
            title: $translate.instant("telecom_sidebar_section_pack"),
            error: $translate.instant("telecom_sidebar_load_error"),
            category: "xdsl",
            icon: "telecom-ethernet",
            allowSubItems: true,
            onLoad: self.fetchData,
            loadOnState: "telecom.pack",
            allowSearch: true,
            infiniteScroll: true
        });

        return self.mainSectionItem;
    };

});
