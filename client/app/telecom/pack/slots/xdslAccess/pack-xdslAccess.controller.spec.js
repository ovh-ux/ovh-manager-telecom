"use strict";

describe("Controller : PackAccessCtrl", function () {
    // load the controller"s module
    beforeEach(angular.mock.module("managerAppMock"));

    var ssoAuthentication;
    beforeEach(inject(function ($injector) {
        ssoAuthentication = $injector.get("ssoAuthentication");
        ssoAuthentication.setIsLoggedIn(true);
    }));

    var PackAccessCtrl;
    var scope;
    var routeParams;
    var _$httpBackend;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($httpBackend, $controller, $rootScope, $stateParams, $injector) {
        /** * APIv6 Auth ***/
        var authentication;
        authentication = $injector.get("ssoAuthentication");
        authentication.setIsLoggedIn(true);

        /******************/

        scope = $rootScope.$new();

        scope.service = {
            name: "access",
            used: 1,
            inCreation: 0,
            total: 1,
            available: 0
        };

        routeParams = $stateParams;
        routeParams.packName = "packadsl-27929302";

        $httpBackend.whenGET(/translations\/Messages\w+\.json$/).respond(200, {});
        $httpBackend.whenGET("/apiv6/me").respond(200, {});
        $httpBackend.whenGET("/apiv6/me/paymentMean/creditCard").respond(200, []);
        $httpBackend.whenGET("/apiv6/me/paymentMean/paypal").respond(200, []);
        $httpBackend.whenGET("/apiv6/me/paymentMean/bankAccount?state=valid").respond(200, []);
        $httpBackend.whenGET("/2api/me/ovhAccount/all").respond(200, []);
        $httpBackend.whenGET("app/home/home.html").respond(200, {});
        _$httpBackend = $httpBackend;

        PackAccessCtrl = $controller("PackAccessCtrl", {
            $scope: scope,
            routeParams: routeParams
        });
    }));

    var mockAccesServices = [
        {
            ipv6Enabled: false,
            status: "active",
            pairsNumber: 1,
            lnsRateLimit: null,
            accessName: "xdsl-la90152-213",
            description: "Vog Touquet Tr",
            accessType: "adsl",
            monitoring: true,
            capabilities: {
                canChangeDslamProfile: false,
                canGetRadiusConnectionLogs: true,
                canResetDslamPort: false,
                hasDslamPort: false,
                canChangeLns: true,
                canApplyLnsRateLimit: false
            },
            address: {
                firstName: "Philippe",
                zipCode: "62520",
                street: "Av St Jean",
                floor: "",
                residence: "",
                numberStreet: "38",
                city: "Le Touquet Paris Plage",
                door: "",
                building: "",
                inseeCode: "62826",
                lastName: "Ingels",
                stairs: "",
                rivoliCode: "1140"
            },
            nra: "LET62"
        }
    ];

    var mockAccesServiceLines = ["0321051431"];

    describe("Initialisation", function () {

        it("should do a request to 2api/pack/xdsl/packadsl-27929302/access/services", function () {
            _$httpBackend.expectGET("/2api/pack/xdsl/packadsl-27929302/access/services").respond(mockAccesServices);
            _$httpBackend.expectGET("/apiv6/xdsl/xdsl-la90152-213/lines").respond(mockAccesServiceLines);
            _$httpBackend.flush();
        });

        it("should add one service into PackAccessCtrl", function () {
            _$httpBackend.expectGET("/2api/pack/xdsl/packadsl-27929302/access/services").respond(mockAccesServices);
            _$httpBackend.expectGET("/apiv6/xdsl/xdsl-la90152-213/lines").respond(mockAccesServiceLines);
            _$httpBackend.flush();

            expect(PackAccessCtrl.services.length).toEqual(1);
        });
    });
});
