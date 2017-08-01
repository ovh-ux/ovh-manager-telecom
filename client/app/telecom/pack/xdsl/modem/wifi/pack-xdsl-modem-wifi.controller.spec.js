"use strict";

describe("Controller: XdslModemWifiCtrl", function () {

    // load the controller"s module
    beforeEach(angular.mock.module("managerAppMock"));

    var dataXdslModem = readJSON("client/bower_components/ovh-api-services/src/xdsl/modem/xdsl-modem.service.dt.spec.json");
    var dataXdslModemWifi = readJSON("client/bower_components/ovh-api-services/src/xdsl/modem/wifi/xdsl-modem-wifi.service.dt.spec.json");
    var dataXdsl = readJSON("client/bower_components/ovh-api-services/src/xdsl/xdsl.service.dt.spec.json");
    var dataTasks = readJSON("client/bower_components/ovh-api-services/src/xdsl/tasks/current/xdsl-tasks-current.service.dt.spec.json");

    var $httpBackend;
    var $rootScope;
    var $controller;
    var $scope;
    var PackXdslModemMediator;
    var XdslModemWifiCtrl;
    var xdslPack = "xdsl-ja7736-3";

    beforeEach(inject(function (_$httpBackend_, _$rootScope_, _$controller_, $injector, _PackXdslModemMediator_) {
        /** * APIv6 Auth ***/
        var authentication;
        authentication = $injector.get("ssoAuthentication");
        authentication.setIsLoggedIn(true);

        /******************/

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
        $httpBackend.whenGET("/2api/xdsl/" + xdslPack + "/modem/wifi/details").respond(dataXdslModemWifi.get.success);
        $httpBackend.whenGET("app/home/home.html").respond(200, {});

        $scope = $rootScope.$new();
    }));

    afterEach(inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        $scope.$destroy();
    }));

    var initNewCtrl = function () {

        $scope.access = {
            xdsl: dataXdsl.success
        };

        PackXdslModemMediator.disableCapabilities = angular.noop;

        $scope.modem = {
            info: JSON.parse(JSON.stringify(dataXdslModem.modem)),
            tasks: JSON.parse(JSON.stringify(dataTasks.success.data))
        };

        XdslModemWifiCtrl = $controller("XdslModemWifiCtrl", {
            $scope: $scope,
            $stateParams: { serviceName: xdslPack }
        });
        $httpBackend.flush();
    };

    describe("- WIFI -", function () {
        beforeEach(function () {
            initNewCtrl(xdslPack);
        });

        it(" get the current wifi state ", function () {
            expect(XdslModemWifiCtrl.wifi.enabled).toBe(false);
        });

        it(" change the wifi state ", function () {
            XdslModemWifiCtrl.wifi.enabled = true;
            PackXdslModemMediator.capabilities.canChangeWLAN = true;
            $httpBackend.whenPUT("/apiv6/xdsl/" + xdslPack + "/modem/wifi/defaultWIFI").respond(200, null);
            XdslModemWifiCtrl.update();
            $httpBackend.flush();

            expect(PackXdslModemMediator.tasks.changeModemConfigWLAN).toBe(true);
        });

        it(" cannot change the wifi state ", function () {
            PackXdslModemMediator.capabilities.canChangeWLAN = false;
            XdslModemWifiCtrl.wifi.enabled = true;
            XdslModemWifiCtrl.update();

            expect(XdslModemWifiCtrl.undoData.enabled).toBe(false);
            expect(PackXdslModemMediator.tasks.changeModemConfigWLAN).toBeUndefined();
        });

    });

});
