angular.module("managerApp").controller("OverTheBoxCtrl", function ($stateParams, $translate, $q, OvhApiOverTheBox, SidebarMenu, Toast, URLS) {
    "use strict";
    var self = this;

    self.dice = Math.round(Math.random() * 100);
    self.expressLiteOrder = URLS.orderExpressLite;
    self.orderBoost = URLS.orderBoost;

    this.disabledRemote = true;

    this.checkDevices = function () {
        return OvhApiOverTheBox.v6().getDevice({
            serviceName: $stateParams.serviceName
        }).$promise.then(function () {
            self.disabledRemote = false;
        }, function () {
            self.disabledRemote = true;
        }).finally(function () {
            self.loader = false;
        });
    };

    /**
     * Rename the title of the page
     * @param {String} str New Name
     * @returns {Promise}
     */
    self.updateName = function (str) {
        self.nameUpdating = true;

        return OvhApiOverTheBox.v6().putService({
            serviceName: $stateParams.serviceName
        }, {
            customerDescription: str
        }).$promise.then(function () {
            self.service.customerDescription = str;
            SidebarMenu.updateItemDisplay({
                title: self.service.customerDescription || self.service.serviceName
            }, self.service.serviceName, "telecom-otb-section");
            return str;
        }).catch(function (err) {
            Toast.error($translate.instant("overTheBox_error_rename", $stateParams));
            return $q.reject(err);
        }).finally(function () {
            self.nameUpdating = false;
        });
    };

    /**
     * Load services
     */
    this.getService = function () {
        return OvhApiOverTheBox.v6().get({ serviceName: $stateParams.serviceName }).$promise.then(
            function (service) {
                self.service = service;
            },
            function (error) {
                self.error.service = error.data;
                Toast.error([$translate.instant("an_error_occured"), error.data.message].join(" "));
            }
        );
    };

    function init () {
        return $q.all([
            self.getService(),
            self.checkDevices()
        ]);
    }

    init();
});
