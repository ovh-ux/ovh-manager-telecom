"use strict";

describe("Controller: XdslAccessIpv6Ctrl", function () {

    // load the controller"s module
    beforeEach(angular.mock.module("managerAppMock"));

    var $httpBackend;
    var $rootScope;
    var $controller;
    var $scope;

    beforeEach(inject(function (_$httpBackend_, _$rootScope_, _$controller_, $injector) {
        /** * APIv6 Auth ***/
        var authentication;
        authentication = $injector.get("ssoAuthentication");
        authentication.setIsLoggedIn(true);

        /******************/

        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $controller = _$controller_;

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

    var XdslAccessIpv6Ctrl;
    var xdslPack = "xdsl-ja7736-3";

    function initNewCtrl (pack) {
        XdslAccessIpv6Ctrl = $controller("XdslAccessIpv6Ctrl", {
            $scope: $scope,
            $stateParams: { serviceName: pack }
        });
    }

    //-----

    describe("- IPv6 -", function () {

        beforeEach(function () {
            $scope.access = {
                xdsl: {
                    ipv6Enabled: false
                },
                tasks: {
                    current: {}
                }
            };
            $httpBackend.whenPOST("/apiv6/xdsl/" + xdslPack + "/ipv6").respond(201, null);
            initNewCtrl(xdslPack);
        });

        it("activate ipv6", function () {
            $scope.access.xdsl.ipv6Enabled = true;
            XdslAccessIpv6Ctrl.submitIp();
            $httpBackend.flush();
        });

    });

});
