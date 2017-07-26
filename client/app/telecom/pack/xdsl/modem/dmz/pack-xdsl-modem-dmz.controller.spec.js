"use strict";

describe("Controller: XdslModemDmzCtrl", function () {

    // load the controller"s module
    beforeEach(angular.mock.module("managerAppMock"));

    var dataXdslModem = readJSON("client/bower_components/ovh-api-services/src/xdsl/modem/xdsl-modem.service.dt.spec.json");
    var dataXdslModemLan = readJSON("client/bower_components/ovh-api-services/src/xdsl/modem/lan/xdsl-modem-lan.service.dt.spec.json");
    var dataXdsl = readJSON("client/bower_components/ovh-api-services/src/xdsl/xdsl.service.dt.spec.json");

    var validIp = "192.168.5.21";
    var invalidIpWord = "hello world";
    var invalidIp = "256.168.5.21";

    var $httpBackend;
    var $rootScope;
    var $controller;
    var $scope;
    var PackXdslModemMediator;

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
        $httpBackend.whenGET("app/home/home.html").respond(200, {});

        $scope = $rootScope.$new();
    }));

    afterEach(inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        $scope.$destroy();
    }));

    var XdslModemDmzCtrl;
    var xdslPack = "xdsl-ja7736-3";
    var initNewCtrl = function () {

        $httpBackend.whenGET("/apiv6/xdsl/" + xdslPack).respond(200, {});
        $httpBackend.whenGET("/apiv6/xdsl/" + xdslPack + "/modem").respond(200, dataXdslModem.modem);
        $httpBackend.whenGET("/2api/xdsl/" + xdslPack + "/modem/tasks").respond(200, {
            current: {
                data: {
                    changeModemConfigDMZ: true
                }
            },
            capabilities: {
                data: {
                    canChangeDMZ: true
                }
            }
        });

        $scope.access = {
            xdsl: dataXdsl.success
        };

        PackXdslModemMediator.disableCapabilities = angular.noop;

        $httpBackend.whenGET("/2api/xdsl/" + xdslPack + "/modem/lan/details").respond(200, dataXdslModemLan.get.success);
        $controller("XdslModemCtrl", {
            $scope: $scope,
            $stateParams: { serviceName: xdslPack }
        });
        XdslModemDmzCtrl = $controller("XdslModemDmzCtrl", {
            $scope: $scope,
            $stateParams: { serviceName: xdslPack }
        });

        $httpBackend.flush();
    };

    describe("- DMZ -", function () {
        beforeEach(function () {
            initNewCtrl();
        });

        it(" find the current DMZ ", function () {
            expect(PackXdslModemMediator.info.dmzIP).toBeNull();
        });

        it(" cannot change the DMZ IP ", function () {
            delete PackXdslModemMediator.capabilities.canChangeDMZ;
            XdslModemDmzCtrl.dmz = validIp;

            // $httpBackend.whenPUT("/apiv6/xdsl/" + xdslPack + "/modem").respond(403, dataXdslModem.firewall.put.error);
            XdslModemDmzCtrl.changeDmz();

            expect(PackXdslModemMediator.info.dmzIP).toBeNull();
        });

        it(" this is not an IP ", function () {
            XdslModemDmzCtrl.dmz = invalidIpWord;
            XdslModemDmzCtrl.changeDmz();

            expect(PackXdslModemMediator.info.dmzIP).toBeNull();
        });

        it(" this is really not an IP ", function () {
            XdslModemDmzCtrl.dmz = invalidIp;
            XdslModemDmzCtrl.changeDmz();

            expect(PackXdslModemMediator.info.dmzIP).toBeNull();
        });
    });
});
