"use strict";

describe("Controller packMoveContractController - ", function () {

    var $httpBackend;
    var $controller;
    var scope;
    var toastErrorSpy;

    var packName = "packName";
    var form = {
        landline: {
            lineNumber: 1234567,
            status: "active"
        },
        offerCode: "test",
        keepCurrentNumber: false
    };

    var ok = 200;
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

    var controller;
    function initNewCtrl () {
        controller = $controller("PackMoveContractCtrl", {
            $scope: scope,
            ToastError: toastErrorSpy,
            data: {
                packName: packName,
                form: form
            },
            $uibModalInstance: modalInstanceMock
        });
        $httpBackend.flush();
    }

    describe("initialization", function () {
        it("should initialize checkbox variables", function () {
            initNewCtrl();

            expect(controller.checkboxSelected).toBe(false);
        });
    });

    describe("cancel", function () {
        it("should close the modal window", function () {
            initNewCtrl();
            controller.cancel();

            expect(modalInstanceMock.dismiss).toHaveBeenCalled();
        });
    });

    describe("confirm", function () {
        it("should close the modal window on success", function () {

            initNewCtrl();
            controller.confirm();

            expect(modalInstanceMock.close).toHaveBeenCalled();
        });
    });
});
