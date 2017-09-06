"use strict";

describe("Controller: TelecomOrdersCtrl", function () {

    // load the controller"s module
    beforeEach(angular.mock.module("managerAppMock"));

    var ssoAuthentication;
    var $httpBackend;
    var scope;
    var $controller;
    var $translate;
    var OvhApiXdsl;
    var TelecomOrdersCtrl;

    beforeEach(inject(function (_ssoAuthentication_, _$httpBackend_, _$rootScope_, _$controller_, _$translate_, _OvhApiXdsl_) {
        scope = _$rootScope_.$new();
        ssoAuthentication = _ssoAuthentication_;
        $httpBackend = _$httpBackend_;
        $controller = _$controller_;
        $translate = _$translate_;
        OvhApiXdsl = _OvhApiXdsl_;

        ssoAuthentication.setIsLoggedIn(true);
        $httpBackend.whenGET(/.*.html/).respond(200, null);
        $httpBackend.whenGET(/^app\/.*\/translations\/.*\.json$/).respond(200, {});
        $httpBackend.whenGET("/apiv6/me").respond(200, {});
        $httpBackend.whenGET("/apiv6/me/paymentMean/creditCard").respond(200, []);
        $httpBackend.whenGET("/apiv6/me/paymentMean/paypal").respond(200, []);
        $httpBackend.whenGET("/apiv6/me/paymentMean/bankAccount?state=valid").respond(200, []);
        $httpBackend.whenGET("/2api/me/ovhAccount/all").respond(200, []);
        $httpBackend.whenGET("/2api/xdsl/orderFollowup").respond(200, []);
    }));

    afterEach(inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    }));

    function initNewCtrl () {
        TelecomOrdersCtrl = $controller("TelecomOrdersCtrl", {
            $scope: scope,
            OvhApiXdsl: OvhApiXdsl,
            $translate: $translate
        });
        TelecomOrdersCtrl.init();
    }

    describe("- Initialization of controller in error case : ", function () {

        describe(" if /services in error ", function () {
            beforeEach(function () {

                initNewCtrl();
                $httpBackend.flush();
            });
            it(" should throw an error", function () {
                expect(TelecomOrdersCtrl.ordersDetails.length).toBe(0);
                expect(TelecomOrdersCtrl.loading).toBeFalsy();
            });
        });
    });

});
