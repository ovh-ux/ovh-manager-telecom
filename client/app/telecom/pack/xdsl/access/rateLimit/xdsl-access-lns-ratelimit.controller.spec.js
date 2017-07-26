"use strict";

describe("Controller: XdslAccessLnsRateLimitCtrl", function () {

    // load the controller"s module
    beforeEach(angular.mock.module("managerAppMock"));
    var dataXdsl = readJSON("client/bower_components/ovh-api-services/src/xdsl/xdsl.service.dt.spec.json");
    var dataTasks = readJSON("client/bower_components/ovh-api-services/src/xdsl/tasks/current/xdsl-tasks-current.service.dt.spec.json");

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

    var XdslAccessLnsRateLimitCtrl;
    var xdslPack = "xdsl-ja7736-3";

    function initNewCtrl () {

        $scope.access = {
            xdsl: dataXdsl.success,
            tasks: {
                current: dataTasks.success.data
            }
        };

        XdslAccessLnsRateLimitCtrl = $controller("XdslAccessLnsRateLimitCtrl", {
            $scope: $scope,
            $stateParams: { serviceName: xdslPack }
        });
        $scope.$apply();
    }

    //-----

    describe("- LNS Rate Limit -", function () {

        beforeEach(function () {
            initNewCtrl();
            $httpBackend.flush();
        });

        it("get the current rate", function () {
            expect(XdslAccessLnsRateLimitCtrl.rate.disabled).toBe(true);
            expect(XdslAccessLnsRateLimitCtrl.rate.value).toBe(XdslAccessLnsRateLimitCtrl.default);
        });

        it("change the rate", function () {
            var value = 64 * 100;
            $httpBackend.whenPUT("/apiv6/xdsl/" + xdslPack).respond(200, null);
            XdslAccessLnsRateLimitCtrl.rate.disabled = false;
            XdslAccessLnsRateLimitCtrl.rate.value = value;
            XdslAccessLnsRateLimitCtrl.changeRate();
            $httpBackend.flush();
            expect(XdslAccessLnsRateLimitCtrl.doing).toBe(false);
            expect(XdslAccessLnsRateLimitCtrl.rate.value).toBe(value);
        });

        it("cannot change the rate", function () {
            var value = 64 * 100;
            XdslAccessLnsRateLimitCtrl.rate.canApplyLnsRateLimit = false;
            XdslAccessLnsRateLimitCtrl.rate.disabled = false;
            XdslAccessLnsRateLimitCtrl.rate.value = value;
            XdslAccessLnsRateLimitCtrl.changeRate();
            expect(XdslAccessLnsRateLimitCtrl.doing).toBe(false);
            expect(XdslAccessLnsRateLimitCtrl.rate.value).toBe(XdslAccessLnsRateLimitCtrl.undoRate.value);
        });

    });

});
