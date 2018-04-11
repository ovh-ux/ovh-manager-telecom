angular.module("managerApp").controller("OverTheBoxDetailsCtrl", function ($scope, $rootScope, $filter, $translate, $q, $stateParams, XDSL, OVER_THE_BOX, OVERTHEBOX_DETAILS, OvhApiOverTheBox, OverTheBoxGraphService, Toast, ChartjsFactory) {

    "use strict";

    var self = this;

    /**
     * Callback used to display Y scale
     * @param {String} label Current scale label
     * @param {Number} index Index of the current scale label
     * @param  {Array} all   All scale labels
     * @return {String} Label
     */
    var humanizeAxisDisplay = function (label, index, all) {
        var interval = Math.round(all.length / 4);
        if (index === all.length - 1 || index % interval === 0) {
            return $filter("unit-humanize")(label, "generic", 1);
        }
        return "";
    };

    /**
     * Define the display string for a bitrate
     * @param {Number} bitrate Bitrate in bits per seconds
     * @return {String}
     */
    var displayBitrate = function (bitrate) {
        return $filter("unit-humanize")(bitrate, "bit", 1);
    };

    /**
     * GetAvailable remote actions
     * @returns {Promise}
     */
    function getAvailableAction () {
        self.availableAction = {};
        return OvhApiOverTheBox.v6().getAvailableActions({
            serviceName: $stateParams.serviceName
        }).$promise.then(function (actions) {
            actions.forEach(function (action) {
                self.availableAction[action.name] = true;
            });
        });
    }

    /**
     * Compute current max
     * @param series
     * @returns {{max: number, current: number, rateMbps: number, rateUnit: string}}
     */
    function computeSpeed (series) {
        var max = 0;
        var currentMax = 0;
        var rateUnit = "Mbps";
        var rate = 0;
        if (_.isArray(series) && series.length && series[0].dps) {
            Object.keys(series[0].dps).forEach(function (timeStmp) {
                currentMax = 0;
                for (var i = 0; i < series.length; i++) {
                    currentMax += series[i].dps[timeStmp];
                }
                max = max > currentMax ? max : currentMax;
            });
            rate = Math.round(currentMax / 104857.6) / 10;
            if (!rate) {
                rate = Math.round(currentMax / 102.4) / 10;
                rateUnit = "Kbps";
            }
        }

        return {
            max: max,
            current: currentMax,
            display: {
                value: rate,
                unit: rateUnit
            }
        };
    }

    function makeGraphPositive (graph) {
        _.forEach(Object.keys(graph.dps), function (key) {
            graph.dps[key] = graph.dps[key] < 0 ? 0 : graph.dps[key];
        });
    }

    /**
    * Load graph data
    */
    function getGraphData () {
        if (!$scope.OverTheBox.service) {
            return;
        }

        self.loaders.graph = true;
        $q.all([
            OverTheBoxGraphService.getGraphData({
                service: $scope.OverTheBox.service,
                downSample: OVER_THE_BOX.statistics.sampleRate,
                direction: "in"
            }),
            OverTheBoxGraphService.getGraphData({
                service: $scope.OverTheBox.service,
                downSample: OVER_THE_BOX.statistics.sampleRate,
                direction: "out"
            })
        ]).then(function (data) {
            var inData = data[0] && data[0].data ? data[0].data : [];
            var outData = data[1] && data[1].data ? data[1].data : [];

            var filteredDown = inData
                .filter(function (d) {
                    return self.kpiInterfaces.indexOf(d.tags.iface) > -1;
                });

            _.forEach(filteredDown, makeGraphPositive);
            self.download = computeSpeed(filteredDown);

            var filteredUp = outData
                .filter(function (d) {
                    return self.kpiInterfaces.indexOf(d.tags.iface) > -1;
                });
            _.forEach(filteredUp, makeGraphPositive);
            self.upload = computeSpeed(filteredUp);

            // Download chart
            self.chartDown = new ChartjsFactory(angular.copy(OVERTHEBOX_DETAILS.chart));
            self.chartDown.setYLabel($translate.instant("overTheBox_statistics_bits_per_sec_legend"));
            self.chartDown.setAxisOptions("yAxes", {
                ticks: {
                    callback: humanizeAxisDisplay
                }
            });
            self.chartDown.setTooltipCallback(
                "label",
                function (item) {
                    return displayBitrate(item.yLabel);
                }
            );

            var downSeries = _.chain(filteredDown)
                .map(function (d) {
                    return {
                        name: d.tags.iface,
                        data: Object.keys(d.dps).map(function (key) {
                            return {
                                x: key * 1000,
                                y: d.dps[key] * 8
                            };
                        })
                    };
                })
                .sortByOrder(["name"], ["asc"])
                .value();

            _.forEach(downSeries, function (serie) {
                self.chartDown.addSerie(
                    serie.name,
                    serie.data,
                    {
                        dataset: {
                            fill: true,
                            borderWidth: 1
                        }
                    }
                );
            });
            if (!downSeries.length) {
                self.chartDown.options.scales.xAxes = [];
            }

            // Upload chart
            self.chartUp = new ChartjsFactory(angular.copy(OVERTHEBOX_DETAILS.chart));
            self.chartUp.setYLabel($translate.instant("overTheBox_statistics_bits_per_sec_legend"));
            self.chartUp.setAxisOptions("yAxes", {
                ticks: {
                    callback: humanizeAxisDisplay
                }
            });
            self.chartUp.setTooltipCallback(
                "label",
                function (item) {
                    return displayBitrate(item.yLabel);
                }
            );

            var upSeries = _.chain(filteredUp)
                .map(function (d) {
                    return {
                        name: d.tags.iface,
                        data: Object.keys(d.dps).map(function (key) {
                            return {
                                x: key * 1000,
                                y: d.dps[key] * 8
                            };
                        })
                    };
                })
                .sortByOrder(["name"], ["asc"])
                .value();

            _.forEach(upSeries, function (serie) {
                self.chartUp.addSerie(
                    serie.name,
                    serie.data,
                    {
                        dataset: {
                            fill: true,
                            borderWidth: 1
                        }
                    }
                );
            });
            if (!upSeries.length) {
                self.chartUp.options.scales.xAxes = [];
            }

        }).catch(function (err) {
            Toast.error($translate.instant("overthebox_traffic_error"));
            $q.reject(err);
        }).finally(function () {
            self.loaders.graph = false;
        });
    }

    function init () {
        self.loaders = {
            init: true,
            checking: false,
            device: false,
            graph: false
        };

        self.error = {
            checking: null,
            noDeviceLinked: false
        };

        self.nameEditable = false;

        self.service = null;
        self.deviceIds = [];
        self.allDevices = [];
        self.device = null;

        $q.all([
            self.getServiceInfos(),
            self.checkDevices(),
            self.getDevice(),
            self.getTasks(),
            OvhApiOverTheBox.v6().get({
                serviceName: $stateParams.serviceName
            }).$promise.then(function (otb) {
                self.nameEditable = otb.status === "active";
                return otb;
            })
        ]).finally(function () {
            if (self.allDevices.length === 1 && !self.device) {
                self.deviceIdToLink = self.allDevices[0].deviceId;
            }
            self.loaders.init = false;
            getGraphData();
        });
        getAvailableAction();
    }

    /**
     * Launch remote action to the NUC
     * @param {String} actionName Action to launch
     * @returns {Promise}
     */
    self.LaunchAction = function (actionName) {
        self.availableAction = {};
        return OvhApiOverTheBox.v6().launchAction({
            serviceName: $stateParams.serviceName
        }, {
            name: actionName
        }).$promise.then(
            function (data) {
                Toast.success($translate.instant("overTheBox_action_launch_success"));
                return data;
            }
        ).catch(
            function (err) {
                Toast.error($translate.instant("overTheBox_action_launch_error"));
                return $q.reject(err);
            }
        ).finally(
            function () {
                getAvailableAction();
            }
        );
    };

    /**
     * Load Service info
     */
    self.getServiceInfos = function () {
        self.loaders.infos = true;
        return OvhApiOverTheBox.v6().getServiceInfos({ serviceName: $stateParams.serviceName }).$promise.then(
            function (serviceInfos) {
                self.serviceInfos = serviceInfos;
                if (self.serviceInfos && self.serviceInfos.renew) {
                    self.serviceInfos.renew.undoDeleteAtExpiration = self.serviceInfos.renew.deleteAtExpiration;
                }
                return serviceInfos;
            }
        ).catch(function (error) {
            self.error.tasks = error.data;
            Toast.error([$translate.instant("an_error_occured"), error.data.message].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loaders.infos = false;
        });
    };

    /**
     * Load Tasks
     */
    self.getTasks = function () {
        self.loaders.tasks = true;
        return OvhApiOverTheBox.v6().getTasks(
            {
                serviceName: $stateParams.serviceName
            }
        ).$promise.then(
            function (tasks) {
                self.tasks = tasks;
                return tasks;
            }
        ).catch(
            function (error) {
                self.error.tasks = error.data;
                Toast.error([$translate.instant("an_error_occured"), error.data.message].join(" "));
                return $q.reject(error);
            }
        ).finally(function () {
            self.loaders.tasks = false;
        });
    };

    /**
     * Check devices
     */
    self.checkDevices = function () {
        self.loaders.checking = true;
        return OvhApiOverTheBox.v6().checkDevices().$promise.then(
            function (devices) {
                self.allDevices = devices;
                self.deviceIds = devices.map(function (device) {
                    return device.deviceId;
                });
                return self.deviceIds;
            }
        ).catch(
            function (error) {
                self.error.checking = error.data;
                Toast.error([$translate.instant("an_error_occured"), error.data.message].join(" "));
                return $q.reject(error);
            }
        ).finally(
            function () {
                self.loaders.checking = false;
            }
        );
    };

    /**
     * Get connected devices
     */
    self.getDevice = function () {
        self.loaders.device = true;
        return OvhApiOverTheBox.v6().getDevice({
            serviceName: $stateParams.serviceName
        }).$promise.then(
            function (devices) {
                self.device = devices;
                self.kpiInterfaces = devices.networkInterfaces.filter(function (netInterface) {
                    return netInterface.gateway != null;
                }).map(function (netInterface) {
                    return netInterface.device ? netInterface.device : netInterface.name;
                });
                return devices;
            }
        ).catch(
            function (error) {
                if (error.status === 404) {
                    self.error.noDeviceLinked = true;
                }
                return $q.reject(error);
            }
        ).finally(function () {
            self.loaders.device = false;
        });
    };

    /**
     * Link a device
     * @param {Object} device Device to link
     */
    self.linkDevice = function (device) {
        self.loaders.device = true;
        return OvhApiOverTheBox.v6().linkDevice({
            serviceName: $stateParams.serviceName
        }, {
            deviceId: device.deviceId
        }).$promise.then(
            function () {
                self.device = device;
                Toast.success($translate.instant("overTheBox_link_device_success"));
                return device;
            }
        ).catch(
            function (error) {
                Toast.error([$translate.instant("an_error_occured"), error.data.message].join(" "));
                return $q.reject(error);
            }
        ).finally(function () {
            self.loaders.device = false;
        });
    };

    /**
     * check if Service can be resiliated
     * @return {Boolean}
     */
    self.canResiliate = function () {
        if (!this.serviceInfos || !this.serviceInfos.renew) {
            return false;
        }
        return !this.serviceInfos.renew.deleteAtExpiration && !this.serviceInfos.undoDeleteAtExpiration && this.serviceInfos.canDeleteAtExpiration;
    };

    /**
     * Check if an on-going resiliation can be cancelled
     * @return {Boolean}
     */
    self.canCancelResiliation = function () {
        if (self.canResiliate()) {
            return false;
        }
        if (!this.serviceInfos || !this.serviceInfos.renew) {
            return false;
        }
        return this.serviceInfos.renew.deleteAtExpiration && !this.serviceInfos.undoDeleteAtExpiration;
    };

    /**
     * Resiliate the current service
     * @return {Promise}
     */
    self.resiliate = function () {
        self.loaders.resiliating = true;
        return OvhApiOverTheBox.v6().deleteAtExpiration({
            serviceName: $stateParams.serviceName
        }, null).$promise.then(self.getServiceInfos).then(
            function (data) {
                Toast.success(
                    $translate.instant(
                        "overTheBox_resiliation_success",
                        {
                            service: $scope.OverTheBox.service.customerDescription || $scope.OverTheBox.service.serviceName,
                            date: moment(self.serviceInfos.expiration).format("DD/MM/YYYY")
                        }
                    )
                );
                return data;
            }
        ).catch(function (err) {
            Toast.error(
                $translate.instant(
                    "overTheBox_resiliation_error",
                    {
                        service: $scope.OverTheBox.service.customerDescription || $scope.OverTheBox.service.serviceName
                    }
                )
            );
            return $q.reject(err);
        }).finally(function () {
            self.loaders.resiliating = false;
        });
    };

    /**
     * Cancel the résiliation of the current service
     * @return {Promise}
     */
    self.cancelResiliation = function () {
        self.loaders.cancellingResiliation = true;
        return OvhApiOverTheBox.v6().keepAtExpiration({
            serviceName: $stateParams.serviceName
        }, null).$promise.then(self.getServiceInfos).then(function (data) {
            Toast.success(
                $translate.instant(
                    "overTheBox_cancel_resiliation_success",
                    {
                        service: $scope.OverTheBox.service.customerDescription || $scope.OverTheBox.service.serviceName
                    }
                )
            );
            return data;
        }).catch(function (err) {
            Toast.error(
                $translate.instant(
                    "overTheBox_resiliation_cancel_error",
                    {
                        service: $scope.OverTheBox.service.customerDescription || $scope.OverTheBox.service.serviceName
                    }
                )
            );
            return $q.reject(err);
        }).finally(function () {
            self.loaders.cancellingResiliation = false;
        });
    };

    init();

});
