"use strict";

describe("Controller: XdslModemMtuCtrl", function () {

    // load the controller"s module
    beforeEach(angular.mock.module("managerAppMock"));

    var dataXdslModem = readJSON("client/bower_components/ovh-api-services/src/xdsl/modem/xdsl-modem.service.dt.spec.json");
    var dataXdsl = readJSON("client/bower_components/ovh-api-services/src/xdsl/xdsl.service.dt.spec.json");

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

    var XdslModemMtuCtrl;
    var xdslPack = "xdsl-ja7736-3";
    var initNewCtrl = function () {

        $scope.access = {
            xdsl: dataXdsl.success
        };

        PackXdslModemMediator.disableCapabilities = angular.noop;

        XdslModemMtuCtrl = $controller("XdslModemMtuCtrl", {
            $scope: $scope,
            $stateParams: { serviceName: xdslPack }
        });

    };

    describe("- MTU -", function () {
        beforeEach(function () {
            initNewCtrl(xdslPack);
            $httpBackend.flush();
        });

        it(" find the current MTU level ", function () {
            expect(XdslModemMtuCtrl.getDisplayValue()).toBe(1492);
            expect(XdslModemMtuCtrl.mtuCurrentValueTmp.value).toBe(1492);
        });

        it(" change the MTU value ", function () {
            PackXdslModemMediator.capabilities.canChangeMtu = true;
            XdslModemMtuCtrl.mtuCurrentValueTmp = { value: 1432 };
            $httpBackend.whenPUT("/apiv6/xdsl/" + xdslPack + "/modem").respond(200, dataXdslModem.firewall.put.success);
            XdslModemMtuCtrl.changeMtuSize();
            $httpBackend.flush();

            expect(XdslModemMtuCtrl.mtuCurrentValue.value).toBe(1432);
        });

        it(" cannot change the MTU value ", function () {
            XdslModemMtuCtrl.mtuCurrentValueTmp = { value: 1432 };
            $httpBackend.whenPUT("/apiv6/xdsl/" + xdslPack + "/modem").respond(403, dataXdslModem.firewall.put.error);
            XdslModemMtuCtrl.changeMtuSize();

            expect(XdslModemMtuCtrl.mtuCurrentValue.value).toBe(1492);
            expect(XdslModemMtuCtrl.mtuCurrentValueTmp.value).toBe(1492);
            expect(PackXdslModemMediator.tasks.changeMTU).toBeUndefined();
        });

        it(" Is not FT ", function () {
            PackXdslModemMediator.capabilities.canChangeMtu = false;
            XdslModemMtuCtrl.mtuCurrentValueTmp = { value: 1432 };
            XdslModemMtuCtrl.changeMtuSize();

            expect(XdslModemMtuCtrl.mtuCurrentValue.value).toBe(1492);
            expect(XdslModemMtuCtrl.mtuCurrentValueTmp.value).toBe(1492);
            expect(PackXdslModemMediator.tasks.changeMTU).toBeUndefined();
        });

    });

});
