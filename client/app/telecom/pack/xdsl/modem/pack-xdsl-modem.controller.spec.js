"use strict";

describe("Controller: XdslModemCtrl", function () {

    var dataTest = readJSON("client/bower_components/ovh-api-services/src/xdsl/modem/xdsl-modem.service.dt.spec.json");

    // load the controller"s module
    beforeEach(angular.mock.module("managerAppMock"));

    var $httpBackend;
    var $rootScope;
    var $controller;
    var $scope;
    var ToastSpy;
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
        ToastSpy = jasmine.createSpy("Toast");

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

    //-----

    var XdslModemCtrl;
    var xdslPack = "xdsl-ja7736-3";

    function initNewCtrl (pack) {
        XdslModemCtrl = $controller("XdslModemCtrl", {
            $scope: $scope,
            $stateParams: { serviceName: pack },
            Toast: { error: ToastSpy }
        });
    }

    //-----

    describe("- Initialization controller in success case -", function () {

        beforeEach(function () {
            $httpBackend.whenGET("/apiv6/xdsl/" + xdslPack).respond(200, {});
            $httpBackend.whenGET("/apiv6/xdsl/" + xdslPack + "/modem").respond(200, dataTest.modem);
            $httpBackend.whenGET("/2api/xdsl/" + xdslPack + "/modem/tasks").respond(200, dataTest.tasks.success);
            initNewCtrl(xdslPack);

            $httpBackend.flush();
        });

        it("should set the values", function () {
            expect(PackXdslModemMediator.capabilities).toEqual(dataTest.tasks.success.capabilities.data);

            expect(XdslModemCtrl.loaders.modem).toBe(false);
        });

    });

    //-----

    describe("- Initialization controller in error case -", function () {

        beforeEach(function () {
            $httpBackend.whenGET("/apiv6/xdsl/unknownPack").respond(404, {});
            $httpBackend.whenGET("/apiv6/xdsl/unknownPack/modem").respond(404, dataTest.modem);
            $httpBackend.whenGET("/2api/xdsl/unknownPack/modem/tasks").respond(404, dataTest.tasks.error);
            initNewCtrl("unknownPack");

            $httpBackend.flush();
        });

        it("should throw an error when get an unknown xdsl Pack", function () {
            expect(ToastSpy).toHaveBeenCalled();
        });
    });

});
