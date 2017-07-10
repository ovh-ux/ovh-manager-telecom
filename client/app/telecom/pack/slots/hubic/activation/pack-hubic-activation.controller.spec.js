"use strict";

describe("Controller: PackHubicActivationCtrl", function () {

    // load the controller"s module
    beforeEach(angular.mock.module("managerAppMock"));

    var PackHubicActivationCtrl;
    var _$httpBackend;
    var scope;
    var routeParams;

    var mockServicesApiResponse = [
        { name: "hostedEmail", used: 1, inCreation: 0, total: 10 },
        { name: "voipBillingAccount", used: 1, inCreation: 0, total: 1 },
        { name: "voipEcoFax", used: 1, inCreation: 0, total: 1 },
        { name: "hubic", used: 1, inCreation: 0, total: 1 },
        { name: "access", used: 1, inCreation: 0, total: 1 },
        { name: "voipLine", used: 1, inCreation: 0, total: 2 }
    ];

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($httpBackend, $controller, $rootScope, $stateParams, $injector) {
        var authentication = $injector.get("ssoAuthentication");
        authentication.setIsLoggedIn(true);

        _$httpBackend = $httpBackend;

        scope = $rootScope.$new();
        routeParams = $stateParams;
        delete routeParams.packName;

        _$httpBackend.whenGET(/translations\/Messages\w+\.json$/).respond(200, {});
        _$httpBackend.whenGET("/apiv6/me").respond(200, {});
        _$httpBackend.whenGET("/apiv6/me/paymentMean/creditCard").respond(200, []);
        _$httpBackend.whenGET("/apiv6/me/paymentMean/paypal").respond(200, []);
        _$httpBackend.whenGET("/apiv6/me/paymentMean/bankAccount?state=valid").respond(200, []);
        _$httpBackend.whenGET("/2api/me/ovhAccount/all").respond(200, []);
        _$httpBackend.whenGET("app/home/home.html").respond(200, {});

        PackHubicActivationCtrl = $controller("PackHubicActivationCtrl", {
            $scope: scope,
            $stateParams: { packName: "xxx" }
        });
    }));

    it("should have services data", function () {
        _$httpBackend.expectGET("/2api/pack/xdsl/xxx/hubic").respond(mockServicesApiResponse);
        PackHubicActivationCtrl.init().then(function () {
            expect(PackHubicActivationCtrl.hubicList.length).toEqual(mockServicesApiResponse.length);
        });
        _$httpBackend.flush();
    });

});
