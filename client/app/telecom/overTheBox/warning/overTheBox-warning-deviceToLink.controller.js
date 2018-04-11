angular.module("managerApp").controller("OrderOverTheBoxDeviceToLinkCtrl", function ($scope, $translate, $state, OvhApiOverTheBox, Toast, ToastError) {
    "use strict";
    var parent = $scope.OrderOverTheBox;
    var self = this;

    function init () {
        self.deviceCount = parent.orphanDevices.length;
        if ((parent.orphanDevices.length === 1) && (parent.unlinkedServices.length === 1)) {
            self.link = {
                service: parent.unlinkedServices[0].service,
                device: parent.orphanDevices[0].deviceId
            };
        }
        if ((parent.orphanDevices.length !== 1) && (parent.unlinkedServices.length === 1)) {
            self.configService = {
                service: parent.unlinkedServices[0].service,
                url: $state.href("telecom.overTheBox.details", { serviceName: parent.unlinkedServices[0].service })
            };
        }
        if ((parent.orphanDevices.length !== 1) && (parent.unlinkedServices.length !== 1)) {
            self.unknown = parent.unlinkedServices;
        }
    }

    self.autoLink = function () {
        if (!self.link) {
            return;
        }
        self.loader = true;
        OvhApiOverTheBox.v6().linkDevice({
            serviceName: self.link.service
        }, {
            deviceId: self.link.device
        }).$promise.then(
            function () {
                Toast.success($translate.instant("overTheBox_link_device_success"));
            },
            function (error) {
                return new ToastError(error);
            }
        ).finally(function () {
            self.loader = false;
        });
    };

    init();

});
