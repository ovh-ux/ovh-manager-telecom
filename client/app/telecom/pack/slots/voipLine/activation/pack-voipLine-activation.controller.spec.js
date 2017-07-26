"use strict";

describe("Controller: PackVoipLineActivationCtrl", function () {

    // load the controller"s module
    beforeEach(angular.mock.module("managerAppMock"));

    var _$httpBackend;
    var _$rootScope;
    var _$controller;
    var _$stateParams;
    var _$state;
    var _Toast;
    var _$translate;
    var PackVoipLineActivationCtrl;
    var scope;
    var mockServicesApiResponse = readJSON("client/bower_components/ovh-api-services/src/pack/xdsl/pack-xdsl.service.dt.spec.json");
    var mockHardwares = readJSON("client/bower_components/ovh-api-services/src/pack/xdsl/voipLine/pack-xdsl-voipLine.service.dt.spec.json").hardwares;
    var mockAddress = readJSON("client/bower_components/ovh-api-services/src/pack/xdsl/voipLine/pack-xdsl-voipLine.service.dt.spec.json").address;

    beforeEach(inject(function (ssoAuthentication, $httpBackend, $rootScope, $controller, $stateParams, $translate,
                                $state, Toast, $injector) {
        /** * APIv6 Auth ***/
        var authentication;

        authentication = $injector.get("ssoAuthentication");
        authentication.setIsLoggedIn(true);

        /******************/

        _$httpBackend = $httpBackend;
        _$rootScope = $rootScope;
        _$controller = $controller;
        _$stateParams = $stateParams;
        _$translate = $translate;

        _$httpBackend.whenGET(/.*.html/).respond(200, null);
        _$httpBackend.whenGET(/^app\/.*\/translations\/.*\.json$/).respond(200, {});
        _$httpBackend.whenGET("/apiv6/me").respond(200, {});
        _$httpBackend.whenGET("/apiv6/me/paymentMean/creditCard").respond(200, []);
        _$httpBackend.whenGET("/apiv6/me/paymentMean/paypal").respond(200, []);
        _$httpBackend.whenGET("/apiv6/me/paymentMean/bankAccount?state=valid").respond(200, []);
        _$httpBackend.whenGET("/2api/me/ovhAccount/all").respond(200, []);
        _$httpBackend.whenGET(/\/apiv6\/pack\/xdsl\/[a-z0-9]+\/services/).respond(200, mockServicesApiResponse);
        _$httpBackend.whenGET(/\/apiv6\/pack\/xdsl\/[a-z0-9]+\/voipLine\/options\/hardwares/).respond(200, mockHardwares);
        _$httpBackend.whenGET(/\/apiv6\/pack\/xdsl\/[a-z0-9]+\/voipLine\/options\/shippingAddresses/).respond(200, mockAddress);

        scope = _$rootScope.$new();
    }));

    afterEach(inject(function () {
        _$httpBackend.verifyNoOutstandingExpectation();
        _$httpBackend.verifyNoOutstandingRequest();
        scope.$destroy();
    }));

    function initNewCtrl () {
        PackVoipLineActivationCtrl = _$controller("PackVoipLineActivationCtrl", {
            $scope: scope,
            $stateParams: _$stateParams,
            Toast: _Toast,
            $translate: _$translate,
            $state: _$state
        });
        PackVoipLineActivationCtrl.init();
    }

    describe("- Initialization of controller in success case : ", function () {
        beforeEach(function () {
            _$stateParams.packName = "xxx";
            initNewCtrl();
            _$httpBackend.flush();
        });

        it(" should have services data", function () {
            expect(PackVoipLineActivationCtrl.modem).toBeDefined();
            expect(PackVoipLineActivationCtrl.hardwares).toBeDefined();
            expect(PackVoipLineActivationCtrl.hardwares.length).toBe(mockHardwares.length - 1);
            expect(PackVoipLineActivationCtrl.modem.linesOnModem).toBe(2);
            expect(PackVoipLineActivationCtrl.shippingAddresses.length).toBe(2);
        });

        it(" should order 2 lines without hardware", function () {
            expect(PackVoipLineActivationCtrl.modem.lines.length).toBe(2);
            PackVoipLineActivationCtrl.modem.lines.forEach(function (line) {
                line.enabled = true;
                line.needHardware = false;
            });
            expect(PackVoipLineActivationCtrl.isOrderReady()).toBe(true);
        });

        it(" should not order 2 lines with hardware not configures", function () {
            PackVoipLineActivationCtrl.modem.lines.forEach(function (line) {
                line.enabled = true;
                line.needHardware = true;
            });
            expect(PackVoipLineActivationCtrl.isOrderReady()).toBe(false);
        });

        it(" should order 2 lines with hardware by transporter", function () {
            PackVoipLineActivationCtrl.shippingMode = "transporter";
            PackVoipLineActivationCtrl.modem.lines.forEach(function (line) {
                line.enabled = true;
                line.needHardware = true;
                line.hardware = mockHardwares[0];
            });
            expect(PackVoipLineActivationCtrl.isOrderReady()).toBe(false);
            PackVoipLineActivationCtrl.transporterAddress = "foo";
            expect(PackVoipLineActivationCtrl.isOrderReady()).toBe(true);
            expect(PackVoipLineActivationCtrl.bill.total()).toBe((2 * mockHardwares[0].deposit.value) + 9.99);
            expect(PackVoipLineActivationCtrl.getTransporter().shippingId).toBe("foo");
        });

        it(" should order 2 lines with hardware by Mondial Relay", function () {
            PackVoipLineActivationCtrl.shippingMode = "mondialRelay";
            PackVoipLineActivationCtrl.modem.lines.forEach(function (line) {
                line.enabled = true;
                line.needHardware = true;
                line.hardware = mockHardwares[0];
            });
            expect(PackVoipLineActivationCtrl.isOrderReady()).toBe(false);
            PackVoipLineActivationCtrl.mondialRelay = { id: "foo" };
            expect(PackVoipLineActivationCtrl.isOrderReady()).toBe(true);
            expect(PackVoipLineActivationCtrl.bill.total()).toBe(2 * mockHardwares[0].deposit.value);
            expect(PackVoipLineActivationCtrl.getTransporter().mondialRelayId).toBe("foo");
        });

    });
});
