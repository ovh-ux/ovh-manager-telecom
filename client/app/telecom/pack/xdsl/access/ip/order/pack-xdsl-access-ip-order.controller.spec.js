"use strict";

describe("Controller ipOrderController - ", function () {

    var $httpBackend;
    var $controller;
    var scope;
    var toastErrorSpy;

    var postIpOrderUrl = "/apiv6/xdsl/xdslIdTest/ips";
    var orderPriceUrl = "/apiv6/price/xdsl/options/ipv4/29";
    var error = 404;
    var ok = 200;
    var xdslId = "xdslIdTest";
    var ipOrderContract = "ipOrderContractTest";
    var modalInstanceMock = {
        close: angular.noop,
        dismiss: angular.noop
    };

    // load the controller"s module
    beforeEach(angular.mock.module("managerAppMock"));

    beforeEach(inject(function (_$httpBackend_, $rootScope, _$controller_, ssoAuthentication) {
        $httpBackend = _$httpBackend_;
        $controller = _$controller_;
        scope = $rootScope.$new();
        toastErrorSpy = jasmine.createSpy("ToastError");
        ssoAuthentication.setIsLoggedIn(true);

        $httpBackend.whenGET("/apiv6/me").respond(ok, {});
        $httpBackend.whenGET("/apiv6/me/paymentMean/creditCard").respond(200, []);
        $httpBackend.whenGET("/apiv6/me/paymentMean/paypal").respond(200, []);
        $httpBackend.whenGET("/apiv6/me/paymentMean/bankAccount?state=valid").respond(200, []);
        $httpBackend.whenGET("/2api/me/ovhAccount/all").respond(ok, []);
        $httpBackend.whenGET(/translations\/Messages\w+\.json$/).respond(ok, {});
        $httpBackend.whenGET("app/home/home.html").respond(200, {});

        spyOn(modalInstanceMock, "dismiss");
        spyOn(modalInstanceMock, "close");
    }));

    afterEach(inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        scope.$destroy();
    }));

    var orderIpController;
    function initNewCtrl () {
        orderIpController = $controller("XdslAccessIpOrderCtrl", {
            $scope: scope,
            ToastError: toastErrorSpy,
            data: { xdslId: xdslId },
            links: { ipOrderContract: ipOrderContract },
            $uibModalInstance: modalInstanceMock
        });
        $httpBackend.flush();
    }

    describe("initialization", function () {
        it("should initialize checkbox variables", function () {
            $httpBackend.whenGET(orderPriceUrl).respond(ok, {});
            initNewCtrl();

            expect(orderIpController.checkbox.userAcceptImmediateExecution).toBe(false);
            expect(orderIpController.checkbox.userAcceptModalities).toBe(false);
        });

        it("should initialize constants variables", function () {
            $httpBackend.whenGET(orderPriceUrl).respond(ok, {});
            initNewCtrl();

            expect(orderIpController.constants.xdslId).toEqual(xdslId);
            expect(orderIpController.constants.amountIpOrdered).toEqual(8);
        });

        it("should initialize loading variable to false", function () {
            $httpBackend.whenGET(orderPriceUrl).respond(ok, {});
            initNewCtrl();

            expect(orderIpController.loading).toBe(false);
        });

        it("should set the price to the value returned by the api", function () {
            var priceReturnedByApi = "8.00 €";
            $httpBackend.whenGET(orderPriceUrl).respond(ok, { text: priceReturnedByApi });
            initNewCtrl();

            expect(orderIpController.constants.price).toEqual(priceReturnedByApi);
        });

        it("should close the modal when an API error occur", function () {
            $httpBackend.whenGET(orderPriceUrl).respond(error, {});
            initNewCtrl();

            expect(modalInstanceMock.dismiss).toHaveBeenCalled();
        });
    });

    describe("cancel", function () {
        it("should close the modal window", function () {
            $httpBackend.whenGET(orderPriceUrl).respond(ok, {});
            initNewCtrl();
            orderIpController.cancel();

            expect(modalInstanceMock.dismiss).toHaveBeenCalled();
        });
    });

    describe("confirm", function () {
        beforeEach(function () {
            $httpBackend.whenGET(orderPriceUrl).respond(ok, {});
        });

        it("should close the modal window on success", function () {
            $httpBackend.whenPOST(postIpOrderUrl).respond(ok, {});

            initNewCtrl();
            orderIpController.confirm();
            $httpBackend.flush();

            expect(modalInstanceMock.close).toHaveBeenCalled();
        });

        it("should not close the modal window on error", function () {
            $httpBackend.whenPOST(postIpOrderUrl).respond(error, {});

            initNewCtrl();
            orderIpController.confirm();
            $httpBackend.flush();

            expect(modalInstanceMock.close).not.toHaveBeenCalled();
        });

        it("should open toast on error", function () {
            $httpBackend.whenPOST(postIpOrderUrl).respond(error, {});

            initNewCtrl();
            orderIpController.confirm();
            $httpBackend.flush();

            expect(toastErrorSpy).toHaveBeenCalled();
        });

        it("should set loading variable to true until API calls resolve", function () {
            $httpBackend.whenPOST(postIpOrderUrl).respond(ok, {});

            initNewCtrl();
            orderIpController.confirm();

            expect(orderIpController.loading).toBe(true);
            $httpBackend.flush();
            expect(orderIpController.loading).toBe(false);
        });
    });
});
