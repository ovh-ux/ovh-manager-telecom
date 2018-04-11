angular.module("managerApp").controller("XdslStatisticsCtrl", function ($q, $scope, $compile, $filter, $templateCache, $stateParams, $http, OvhApiXdsl, Toast, XDSL, $translate, PACK_XDSL_STATISTICS, ChartjsFactory) {
    "use strict";

    var self = this;

    /**
     * Define the display string for a bitrate
     * @param {Number} bitrate Bitrate in bits per seconds
     * @return {String}
     */
    var displayBitrate = function (bitrate) {
        return $filter("unit-humanize")(bitrate, "bit", 1);
    };

    /**
     * Define the display string for ping value
     * @param {Number} pingrate Ping in milliseconds
     * @return {String}
     */
    var displayPingrate = function (pingrate) {
        if (pingrate < 1000) {
            return $translate.instant("xdsl_statistics_ping_ms", { value: pingrate.toFixed(1) });
        }
        return $translate.instant("xdsl_statistics_ping_s", { value: (pingrate / 1000).toFixed(1) });
    };

    /**
     * Callback used to display Y scale
     * @param {String} label Current scale label
     * @param {Number} index Index of the current scale label
     * @param  {Array} all   All scale labels
     * @return {String} Label
     */
    var logarithmicAxisDisplay = function (label, index, all) {
        var interval = Math.round(all.length / 4);
        if (index === all.length - 1 || index % interval === 0) {
            return $filter("unit-humanize")(label, "generic", 1);
        }
        return "";
    };

    /**
     * Get the statistics of a line
     * @param {String} type   Some of :
     *          - snr:upload
     *          - snr:download,
     *          - attenuation:upload,
     *          - attenuation:download,
     *          - synchronization:upload,
     *          - synchronization:download
     * @param {String} period Period to request :
     *          - daily
     *          - monthly
     *          - preview
     *          - weekly
     *          - yearly
     * @return {Promise} Promise that is always resolved
     */
    var getLinesStatistics = function (type, period) {
        return OvhApiXdsl.Lines().v6().getStatistics({
            xdslId: $stateParams.serviceName,
            period: period,
            number: $stateParams.number,
            type: type
        }).$promise.then(function (statistics) {
            var datas = _.get(statistics, "values") || [];
            return datas.map(function (data) {
                return [data.timestamp * 1000, data.value];
            });
        }).catch(function () {
            return [];
        });
    };

    /**
     * Get the statistics of an access
     * @param {String} type   Some of :
     *          - ping
     *          - traffic:upload,
     *          - traffic:download,
     * @param {String} period Period to request :
     *          - daily
     *          - monthly
     *          - preview
     *          - weekly
     *          - yearly
     * @return {Promise} Promise that is always resolved
     */
    var getAccessStatistics = function (type, period) {
        return OvhApiXdsl.v6().statistics({
            xdslId: $stateParams.serviceName,
            period: period,
            type: type
        }).$promise.then(function (statistics) {
            var datas = statistics.values || [];
            return datas.map(function (data) {
                return [data.timestamp * 1000, data.value];
            });
        }).catch(function () {
            return [];
        });
    };

    /**
     * Get synchronisatoin statistic for the line
     * @param {String} period Period to request :
     *          - daily
     *          - monthly
     *          - preview
     *          - weekly
     *          - yearly
     * @return {promise}
     */
    this.getSynchronizationStatistics = function (period) {
        this.synchronization.loading = true;
        return $q.all({
            uploads: getLinesStatistics("synchronization:upload", period),
            downloads: getLinesStatistics("synchronization:download", period)
        }).then(function (stats) {
            self.synchronization.haveSeries = !!(stats.uploads.length && stats.downloads.length);

            self.synchronization.chart = new ChartjsFactory(angular.copy(PACK_XDSL_STATISTICS.chart));
            self.synchronization.chart.setAxisOptions("yAxes", {
                type: "logarithmic",
                ticks: {
                    callback: logarithmicAxisDisplay
                }
            });

            self.synchronization.chart.addSerie(
                $translate.instant("xdsl_statistics_download_label"),
                _.map(stats.downloads, function (point) {
                    return {
                        x: point[0],
                        y: point[1]
                    };
                }),
                {
                    dataset: {
                        fill: true,
                        borderWidth: 1
                    }
                }
            );

            self.synchronization.chart.addSerie(
                $translate.instant("xdsl_statistics_upload_label"),
                _.map(stats.uploads, function (point) {
                    return {
                        x: point[0],
                        y: point[1]
                    };
                }),
                {
                    dataset: {
                        fill: true,
                        borderWidth: 1
                    }
                }
            );

            if (!stats.downloads.length && !stats.uploads.length) {
                self.synchronization.chart.options.scales.xAxes = [];
            }

            self.synchronization.chart.setTooltipCallback(
                "label",
                function (item) {
                    return displayBitrate(item.yLabel);
                }
            );

            self.synchronization.chart.setYLabel($translate.instant("xdsl_statistics_bits_per_sec_legend"));

            return self.synchronization.chart;
        }).finally(function () {
            self.synchronization.loading = false;
        });
    };

    /**
     * Get traffic statistic for the line
     * @param {String} period Period to request :
     *          - daily
     *          - monthly
     *          - preview
     *          - weekly
     *          - yearly
     * @return {promise}
     */
    this.getTrafficStatistics = function (period) {
        this.traffic.loading = true;
        return $q.all({
            uploads: getAccessStatistics("traffic:upload", period),
            downloads: getAccessStatistics("traffic:download", period)
        }).then(function (stats) {
            self.traffic.haveSeries = !!(stats.uploads.length && stats.downloads.length);

            self.traffic.chart = new ChartjsFactory(angular.copy(PACK_XDSL_STATISTICS.chart));

            self.traffic.chart.setAxisOptions("yAxes", {
                type: "logarithmic",
                ticks: {
                    callback: logarithmicAxisDisplay
                }
            });

            self.traffic.chart.addSerie(
                $translate.instant("xdsl_statistics_download_label"),
                _.map(stats.downloads, function (point) {
                    return {
                        x: point[0],
                        y: point[1]
                    };
                }),
                {
                    dataset: {
                        fill: true,
                        borderWidth: 1
                    }
                }
            );

            self.traffic.chart.addSerie(
                $translate.instant("xdsl_statistics_upload_label"),
                _.map(stats.uploads, function (point) {
                    return {
                        x: point[0],
                        y: point[1]
                    };
                }),
                {
                    dataset: {
                        fill: true,
                        borderWidth: 1
                    }
                }
            );

            if (!stats.downloads.length && !stats.uploads.length) {
                self.traffic.chart.options.scales.xAxes = [];
            }

            self.traffic.chart.setTooltipCallback(
                "label",
                function (item) {
                    return displayBitrate(item.yLabel);
                }
            );

            self.traffic.chart.setYLabel($translate.instant("xdsl_statistics_bits_per_sec_legend"));

            return self.traffic.chart;
        }).finally(function () {
            self.traffic.loading = false;
        });
    };

    /**
     * Get ping statistic for the line
     * @param {String} period Period to request :
     *          - daily
     *          - monthly
     *          - preview
     *          - weekly
     *          - yearly
     * @return {promise}
     */
    this.getPingStatistics = function (period) {
        this.ping.loading = true;
        return getAccessStatistics("ping", period).then(
            function (statistics) {
                self.ping.haveSeries = !!statistics.length;

                self.ping.chart = new ChartjsFactory(angular.copy(PACK_XDSL_STATISTICS.chart));

                self.ping.chart.setAxisOptions("yAxes", {
                    type: "linear"
                });

                self.ping.chart.addSerie(
                    $translate.instant("xdsl_statistics_ping_title"),
                    _.map(statistics, function (point) {
                        return {
                            x: point[0],
                            y: point[1]
                        };
                    }),
                    {
                        dataset: {
                            fill: true,
                            borderWidth: 1
                        }
                    }
                );

                if (!statistics.length) {
                    self.ping.chart.options.scales.xAxes = [];
                }

                self.ping.chart.setTooltipCallback(
                    "label",
                    function (item) {
                        return displayPingrate(item.yLabel);
                    }
                );

                self.ping.chart.setYLabel($translate.instant("xdsl_statistics_millisecond_legend"));

                return self.ping.chart;
            }
        ).finally(function () {
            self.ping.loading = false;
        });
    };

    /**
     * Get SNR statistic for the line
     * @param {String} period Period to request :
     *          - daily
     *          - monthly
     *          - preview
     *          - weekly
     *          - yearly
     * @return {promise}
     */
    this.getSNRstatistics = function (period) {
        this.snr.loading = true;
        return $q.all({
            uploads: getLinesStatistics("snr:upload", period),
            downloads: getLinesStatistics("snr:download", period)
        }).then(function (stats) {
            self.snr.haveSeries = !!(stats.uploads.length && stats.downloads.length);

            self.snr.chart = new ChartjsFactory(angular.copy(PACK_XDSL_STATISTICS.chart));

            self.snr.chart.setAxisOptions("yAxes", {
                type: "linear"
            });

            self.snr.chart.addSerie(
                $translate.instant("xdsl_statistics_download_label"),
                _.map(stats.downloads, function (point) {
                    return {
                        x: point[0],
                        y: point[1]
                    };
                }),
                {
                    dataset: {
                        fill: true,
                        borderWidth: 1
                    }
                }
            );

            self.snr.chart.addSerie(
                $translate.instant("xdsl_statistics_upload_label"),
                _.map(stats.uploads, function (point) {
                    return {
                        x: point[0],
                        y: point[1]
                    };
                }),
                {
                    dataset: {
                        fill: true,
                        borderWidth: 1
                    }
                }
            );

            if (!stats.downloads.length && !stats.uploads.length) {
                self.snr.chart.options.scales.xAxes = [];
            }

            self.snr.chart.setTooltipCallback(
                "label",
                function (item) {
                    return $translate.instant("xdsl_statistics_decibel", { value: item.yLabel.toFixed(1) });
                }
            );

            self.snr.chart.setYLabel($translate.instant("xdsl_statistics_decibel_legend"));

            return self.snr.chart;
        }).finally(function () {
            self.snr.loading = false;
        });
    };

    /**
     * Get attenuation statistic for the line
     * @param {String} period Period to request :
     *          - daily
     *          - monthly
     *          - preview
     *          - weekly
     *          - yearly
     * @return {promise}
     */
    this.getAttenuationStatistics = function (period) {
        this.attenuation.loading = true;
        return $q.all({
            uploads: getLinesStatistics("attenuation:upload", period),
            downloads: getLinesStatistics("attenuation:download", period)
        }).then(function (stats) {
            self.attenuation.haveSeries = !!(stats.uploads.length && stats.downloads.length);

            self.attenuation.chart = new ChartjsFactory(angular.copy(PACK_XDSL_STATISTICS.chart));

            self.attenuation.chart.setAxisOptions("yAxes", {
                type: "linear"
            });

            self.attenuation.chart.addSerie(
                $translate.instant("xdsl_statistics_download_label"),
                _.map(stats.downloads, function (point) {
                    return {
                        x: point[0],
                        y: point[1]
                    };
                }),
                {
                    dataset: {
                        fill: true,
                        borderWidth: 1
                    }
                }
            );

            self.attenuation.chart.addSerie(
                $translate.instant("xdsl_statistics_upload_label"),
                _.map(stats.uploads, function (point) {
                    return {
                        x: point[0],
                        y: point[1]
                    };
                }),
                {
                    dataset: {
                        fill: true,
                        borderWidth: 1
                    }
                }
            );

            if (!stats.downloads.length && !stats.uploads.length) {
                self.attenuation.chart.options.scales.xAxes = [];
            }

            self.attenuation.chart.setTooltipCallback(
                "label",
                function (item) {
                    return $translate.instant("xdsl_statistics_decibel", { value: item.yLabel.toFixed(1) });
                }
            );

            self.attenuation.chart.setYLabel($translate.instant("xdsl_statistics_decibel_legend"));

            return self.attenuation.chart;
        }).finally(function () {
            self.attenuation.loading = false;
        });
    };

    /**
     * Initialize the controller
     * @return {Promise}
     */
    this.$onInit = function () {

        this.charts = {};

        this.periodOptions = XDSL.statisticsPeriodEnum;

        this.synchronization = {
            period: "preview"
        };
        this.traffic = {
            period: "preview"
        };
        this.ping = {
            period: "preview"
        };
        this.snr = {
            period: "preview"
        };
        this.attenuation = {
            period: "preview"
        };

        return $q.all([
            self.getSNRstatistics(self.snr.period).then(function () {
                return self.getAttenuationStatistics(self.attenuation.period).then(function () {
                    return self.getSynchronizationStatistics(self.synchronization.period);
                });
            }),
            self.getPingStatistics(self.ping.period).then(function () {
                return self.getTrafficStatistics(self.traffic.period);
            })
        ]);
    };
});
