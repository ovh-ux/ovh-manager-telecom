"use strict";

describe("Controller: XdslModemConnectedDevicesCtrl", function () {

    // load the controller"s module
    beforeEach(angular.mock.module("managerAppMock"));

    var dataXdslModem = readJSON("client/bower_components/ovh-api-services/src/xdsl/modem/xdsl-modem.service.dt.spec.json");
    var dataXdsl = readJSON("client/bower_components/ovh-api-services/src/xdsl/xdsl.service.dt.spec.json");
    var dataTasks = readJSON("client/bower_components/ovh-api-services/src/xdsl/tasks/current/xdsl-tasks-current.service.dt.spec.json");
    var dataDevices = readJSON("client/bower_components/ovh-api-services/src/xdsl/modem/connectedDevices/xdsl-modem-connectedDevices.service.dt.spec.json");

    var $httpBackend;
    var $rootScope;
    var $controller;
    var $scope;
    var PackXdslModemMediator;

    beforeEach(inject(function (_$httpBackend_, _$rootScope_, _$controller_, $injector, _PackXdslModemMediator_) {
        var authentication = $injector.get("ssoAuthentication");
        authentication.setIsLoggedIn(true);

        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $controller = _$controller_;
        PackXdslModemMediator = _PackXdslModemMediator_;

        $httpBackend.whenGET(/translations\/Messages\w+\.json$/).respond(200, {});
        $httpBackend.whenGET("/apiv6/me").respond(200, {});
        $httpBackend.whenGET("/apiv6/me/paymentMean/creditCard").respond(200, []);
        $httpBackend.whenGET("/apiv6/me/paymentMean/paypal").respond(200, []);
        $httpBackend.whenGET("/apiv6/me/paymentMean/bankAccount?state=valid").respond(200, []);
        $httpBackend.whenGET("/2api/me/ovhAccount/all").respond(200, []);
        $httpBackend.whenGET("app/home/home.html").respond(200, {});
        $httpBackend.whenGET(/^\/2api\/xdsl\/[^\/]*\/modem\/connectedDevices$/).respond(200, []);

        $scope = $rootScope.$new();
    }));

    afterEach(inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        $scope.$destroy();
    }));

    var XdslModemDeviceCtrl;
    var xdslPack = "xdsl-ja7736-3";

    var initNewCtrl = function () {

        $scope.access = {
            xdsl: dataXdsl.success
        };

        PackXdslModemMediator.disableCapabilities = angular.noop;

        $scope.modem = {
            info: JSON.parse(JSON.stringify(dataXdslModem.modem)),
            tasks: {
                current: JSON.parse(JSON.stringify(dataTasks.success.data))
            }
        };

        $httpBackend.whenPOST("/2api/xdsl/" + xdslPack + "/modem/connectedDevices/refresh").respond(200, dataDevices.success.status);
        XdslModemDeviceCtrl = $controller("XdslModemConnectedDevicesCtrl", {
            $scope: $scope,
            $stateParams: { serviceName: xdslPack }
        });
        $httpBackend.flush();

    };

    describe("- Devices -", function () {
        beforeEach(function () {
            initNewCtrl(xdslPack);
        });

        it(" get the connected devices ", function () {
            expect(XdslModemDeviceCtrl.devices.length).toBe(0);
        });

    });
});
