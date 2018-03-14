"use strict";

describe("Controller: TelecomdashboardbillsCtrl", function () {

    var $httpBackend;
    var $controller;
    var scope;
    var ToastErrorSpy;

    var getLastBillsUrl = /\/2api\/me\/bill\/last\?*/;
    var error = 404;
    var ok = 200;
    var TelecomDashboardBillsCtrl = null;

    // load the controller"s module
    beforeEach(angular.mock.module("managerAppMock"));

    beforeEach(inject(function (_$httpBackend_, $rootScope, _$controller_, ssoAuthentication) {
        $httpBackend = _$httpBackend_;
        $controller = _$controller_;
        scope = $rootScope.$new();
        ToastErrorSpy = jasmine.createSpy("ToastError");
        ssoAuthentication.setIsLoggedIn(true);

        $httpBackend.whenGET("/apiv6/me").respond(200, {});
        $httpBackend.whenGET("/apiv6/me/paymentMean/creditCard").respond(200, []);
        $httpBackend.whenGET("/apiv6/me/paymentMean/paypal").respond(200, []);
        $httpBackend.whenGET("/apiv6/me/paymentMean/bankAccount?state=valid").respond(200, []);
        $httpBackend.whenGET("/2api/me/ovhAccount/all").respond(200, []);
        $httpBackend.whenGET("app/home/home.html").respond(200, {});
    }));

    afterEach(inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        scope.$destroy();
    }));

    function initNewCtrl () {
        TelecomDashboardBillsCtrl = $controller("TelecomDashboardBillsCtrl", {
            $scope: scope,
            ToastError: ToastErrorSpy
        });
        TelecomDashboardBillsCtrl.$onInit();
    }

    describe("initialization", function () {

        it("should call ToastError when getLastBill API call fail", function () {
            $httpBackend.expectGET(getLastBillsUrl).respond(error, []);
            initNewCtrl();
            $httpBackend.flush();
            expect(ToastErrorSpy).toHaveBeenCalled();
        });

        it("should not call ToastError when getLastBill API call succeeded", function () {
            $httpBackend.whenGET(getLastBillsUrl).respond(ok, []);
            initNewCtrl();
            $httpBackend.flush();

            expect(ToastErrorSpy).not.toHaveBeenCalled();
        });

        it("should set last variable to returned API value", function () {
            var bills = [{}, {}];
            $httpBackend.expectGET(getLastBillsUrl).respond(ok, bills);
            initNewCtrl();
            $httpBackend.flush();

            expect(TelecomDashboardBillsCtrl.lastBills.length).toEqual(bills.length);
        });
    });
});
