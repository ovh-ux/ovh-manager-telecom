angular.module("managerApp").controller("OverTheBoxLogsCtrl", function ($scope, $stateParams, OvhApiOverTheBox, OvhTailLogs) {
    "use strict";
    var self = this;

    self.logger = null;

    self.stopLog = function () {
        self.logger.stop();
    };

    self.startLog = function () {
        self.logger.log();
    };

    self.getLogs = function () {
        self.logger = self.logger.logs;
        return self.logger;
    };

    function init () {

        self.logger = new OvhTailLogs({
            source: function () {
                return OvhApiOverTheBox.v6().getLogs({
                    serviceName: $stateParams.serviceName
                }, {}).$promise.then(function (logs) {
                    return logs.url;
                });
            },
            delay: 2000
        });

        self.startLog();
    }


    init();

    $scope.$on("$destroy", function () {
        self.logger.stop();
    });
});
