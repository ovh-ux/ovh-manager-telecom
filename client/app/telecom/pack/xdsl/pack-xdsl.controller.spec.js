describe("Controller pack-xdsl - ", function () {
    "use strict";

    var $httpBackend;
    var $controller;
    var scope;
    var ok = 200;
    var serviceName = "83843843432424";
    var service = {
        $resolved: true,
        accessName: serviceName,
        accessType: "adsl",
        address: Object,
        capabilities: Object,
        description: "xdsl-ou2050-1",
        ipv6Enabled: true,
        lnsRateLimit: null,
        monitoring: true,
        nra: "PIL59",
        pairsNumber: 1,
        role: "main",
        status: "active"
    };

    // load the controller"s module
    beforeEach(angular.mock.module("managerAppMock"));

    beforeEach(inject(function (_$httpBackend_, _$rootScope_, _$controller_, ssoAuthentication) {
        $httpBackend = _$httpBackend_;
        $controller = _$controller_;
        scope = _$rootScope_.$new();
        ssoAuthentication.setIsLoggedIn(true);

        $httpBackend.whenGET("/apiv6/me").respond(200, {});
        $httpBackend.whenGET("/apiv6/me/paymentMean/creditCard").respond(200, []);
        $httpBackend.whenGET("/apiv6/me/paymentMean/paypal").respond(200, []);
        $httpBackend.whenGET("/apiv6/me/paymentMean/bankAccount?state=valid").respond(200, []);
        $httpBackend.whenGET("/2api/me/ovhAccount/all").respond(200, []);
        $httpBackend.whenGET("/2api/pack/xdsl").respond(200, {});
        $httpBackend.whenGET(/translations\/Messages\w+\.json$/).respond(200, {});
        $httpBackend.whenGET("app/home/home.html").respond(ok, {});
        scope.$on = angular.noop;
    }));

    afterEach(inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        scope.$destroy();
    }));

    var controller;
    function initNewCtrl () {
        controller = $controller("PackXdslCtrl", {
            $stateParams: { serviceName: serviceName },
            $scope: scope
        });
    }

    describe("on state change", function () {
        beforeEach(function () {
            $httpBackend.whenGET("/apiv6/xdsl/" + serviceName).respond(ok, service);
            $httpBackend.whenGET("/apiv6/xdsl/" + serviceName + "/modem").respond(ok, {});
        });

        it("should set status variable when on state telecom.pack.xdsl.access-order state", function (done) {
            var expected = "active";
            initNewCtrl();

            controller.updateUIForState({ name: "telecom.pack.xdsl.access-order" });
            $httpBackend.flush();

            expect(controller.content.status).toEqual(expected);
            done();
        });

    });
});
