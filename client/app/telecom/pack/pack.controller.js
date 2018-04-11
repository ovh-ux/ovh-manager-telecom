angular.module("managerApp")
    .controller("PackCtrl", function (
        $scope, $stateParams, $q, $translate,
        OvhApiPackXdsl, Toast, SidebarMenu, resiliationNotification,
        DASHBOARD, PACK) {
        "use strict";

        var self = this;

        this.loader = {
            page: true,
            service: true
        };

        /**
         * Get all services for this pack
         * @param {string} packId Identifier of the pack
         * @returns {Promise}
         */
        this.getAllFrames = function (packId) {
            var promises = [];

            // get all Services
            promises.push(
                OvhApiPackXdsl.v6().getServices(
                    {
                        packId: packId
                    }
                ).$promise.then(
                    function (services) {
                        var filteredServices = _.chain(services)
                            .filter(function (service) {
                                return DASHBOARD.services.indexOf(service.name) > -1;
                            })
                            .map(function (service) {
                                var index = DASHBOARD.services.indexOf(service.name);
                                if (index === -1) {
                                    index = DASHBOARD.services.length;
                                }

                                service.index = index + 1;

                                return service;
                            })
                            .value();

                        self.frames = self.frames.concat(filteredServices);
                    }
                )
            );

            // Append task frame if tasks are pending
            promises.push(OvhApiPackXdsl.Tasks().v6().query(
                {
                    packName: packId
                }).$promise.then(
                function (data) {
                    if (data.length) {
                        self.frames.push(PACK.frames.task);
                    }
                    return data;
                }
            ));

            // Check for a promotion code
            promises.push(OvhApiPackXdsl.PromotionCode().v6().capabilities(
                {
                    packId: $stateParams.packName
                }).$promise.then(function (capabilities) {
                    if (capabilities.canGenerate) {
                        var promotionCodeFrame = _.clone(PACK.frames.promotionCode);
                        promotionCodeFrame.data = capabilities;
                        self.frames.push(promotionCodeFrame);
                    }
                    return capabilities;
                }
            ));

            return $q.all(promises);
        };

        /**
         * Get pack informations
         * @return {Promise}
         */
        this.getPackInformation = function () {
            this.loader.page = true;
            return OvhApiPackXdsl.Aapi().get({
                packId: $stateParams.packName
            }).$promise.then(function (packInfo) {
                self.pack = _.extend(
                    packInfo.general,
                    {
                        informations: packInfo.detail,
                        mainAccess: _.head(packInfo.services)
                    }
                );
                self.resiliationSuccess = resiliationNotification.success;
                resiliationNotification.success = false; // display only once
                self.cancelResiliationSuccess = resiliationNotification.cancelSuccess;
                resiliationNotification.cancelSuccess = false; // display only once
                return packInfo;
            }).catch(function (err) {
                self.inError = true;
                Toast.error($translate.instant("pack_xdsl_oops_an_error_is_occured"));
                return $q.reject(err);
            }).finally(function () {
                self.loader.page = false;
            });
        };

        /**
         * Validate email
         * @param {string} email Email address
         * @return {boolean}
         */
        this.checkEmailAddress = function (email) {
            return validator.isEmail(email);
        };

        /**
         * Initialize the frame list
         * @return {Promise}
         */
        this.initFrames = function () {
            this.loader.service = true;
            this.frames = [PACK.frames.informations];

            return self.getAllFrames($stateParams.packName).catch(function (err) {
                if (err.status !== 460 && err.status !== 403) {
                    Toast.error([$translate.instant("pack_xdsl_oops_an_error_is_occured"), err.data ? err.data.message : ""].join(" "));
                }
                return $q.reject(err);
            }).finally(function () {
                self.loader.service = false;
            });
        };

        /*= ==============================
        =            ACTIONS            =
        ===============================*/

        self.packDescriptionSave = function (newPackDescr) {
            self.loader.save = true;

            return OvhApiPackXdsl.v6().put({
                packId: $stateParams.packName
            }, {
                description: newPackDescr
            }).$promise.then(function () {
                self.pack.description = newPackDescr;

                // rename in sidebar menu
                SidebarMenu.updateItemDisplay({
                    title: newPackDescr || self.pack.offerDescription
                }, $stateParams.packName, "telecom-pack-section");
            }, function (error) {
                Toast.error([$translate.instant("pack_rename_error", $stateParams), error.data.message].join(" "));
                return $q.reject(error);
            }).finally(function () {
                self.loader.save = false;
            });
        };

        /* -----  End of ACTIONS  ------*/

        /**
         * Initialize the controller
         */
        this.$onInit = function () {
            this.inError = false;

            return $q.all({
                packInformation: this.getPackInformation(),
                frames: this.initFrames()
            }).then(function () {
                if (_.isArray(self.frames)) {
                    self.services = _.chain(self.frames)
                        .sortByOrder(["index"])

                        // transform a  [1 x l] matrix to a [2 x l/2] matrix
                        .reduce(function (all, elt, index) {
                            var line = [];
                            if (index % 2) {
                                line = _.last(all);
                            } else {
                                all.push(line);
                            }
                            line.push(elt);
                            return all;
                        }, [])
                        .value();
                }
                return self.services;
            });
        };

        $scope.$on("reload-frames", function () {
            self.$onInit();
        });

    });
