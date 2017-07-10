describe("Controller XdslDeconsolidationContractCtrl - ", function () {
    "use strict";

    var $httpBackend;
    var $controller;
    var ToastErrorSpy;
    var $uibModalInstanceMock;
    var ok = 200;
    var error = 500;
    var serviceName = "83843843432424";
    var requestDeconsolidationUrl = "/apiv6/xdsl/" + serviceName + "/requestTotalDeconsolidation";
    var successRequestResult = {
        error: 200,
        status: "ok"
    };

    var rio = "12345467";

    // load the controller"s module
    beforeEach(angular.mock.module("managerAppMock"));

    beforeEach(inject(function (_$httpBackend_, _$controller_, ssoAuthentication) {
        $httpBackend = _$httpBackend_;
        $controller = _$controller_;
        ToastErrorSpy = jasmine.createSpy("ToastError");

        ssoAuthentication.setIsLoggedIn(true);
        $httpBackend.whenGET("/apiv6/me").respond(200, {});
        $httpBackend.whenGET("/apiv6/me/vipStatus").respond(200, {});
        $httpBackend.whenGET("/apiv6/me/paymentMean/creditCard").respond(200, []);
        $httpBackend.whenGET("/apiv6/me/paymentMean/paypal").respond(200, []);
        $httpBackend.whenGET("/apiv6/me/paymentMean/bankAccount?state=valid").respond(200, []);
        $httpBackend.whenGET("/2api/me/ovhAccount/all").respond(200, []);
        $httpBackend.whenGET(/translations\/Messages\w+\.json$/).respond(200, {});
        $httpBackend.whenGET("app/home/home.html").respond(200, {});
        $httpBackend.whenGET("/apiv6/xdsl/" + serviceName + "/totalDeconsolidationTerms").respond(ok, {
            capabilities: {
                isLegacyOffer: true
            }
        });

        $uibModalInstanceMock = {
            dismiss: angular.noop,
            close: angular.noop
        };
        spyOn($uibModalInstanceMock, "dismiss");
        spyOn($uibModalInstanceMock, "close");
    }));

    afterEach(inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    }));

    var DeconsolidationContractCtrl;

    function initNewCtrl () {
        DeconsolidationContractCtrl = $controller("XdslDeconsolidationContractCtrl", {
            $uibModalInstance: $uibModalInstanceMock,
            data: {
                rio: rio,
                serviceName: serviceName
            },
            ToastError: ToastErrorSpy,
            $stateParams: { name: serviceName }
        });
    }

    describe("init", function () {
        it("should initialize terms", function () {
            initNewCtrl();
            $httpBackend.flush();

            expect(DeconsolidationContractCtrl.terms).not.toBeFalsy();
        });
    });

    describe("confirm", function () {
        it("should set loading variable to true only during during html requests", function () {
            $httpBackend.expectPOST(requestDeconsolidationUrl).respond(ok, successRequestResult);
            initNewCtrl();

            DeconsolidationContractCtrl.confirm();
            expect(DeconsolidationContractCtrl.loading).toBeTruthy();
            $httpBackend.flush();
            expect(DeconsolidationContractCtrl.loading).toBeFalsy();
        });

        describe("success case", function () {
            it("should close modal", function () {
                $httpBackend.expectPOST(requestDeconsolidationUrl).respond(ok, successRequestResult);
                initNewCtrl();

                DeconsolidationContractCtrl.confirm();
                $httpBackend.flush();

                expect($uibModalInstanceMock.close).toHaveBeenCalled();
            });
        });

        describe("error case", function () {
            it("should not close modal", function () {
                $httpBackend.expectPOST(requestDeconsolidationUrl).respond(error, successRequestResult);
                initNewCtrl();

                DeconsolidationContractCtrl.confirm();
                $httpBackend.flush();

                expect($uibModalInstanceMock.close).not.toHaveBeenCalled();
            });
        });

    });

    describe("cancel", function () {
        it("should dismiss modal", function () {
            initNewCtrl();
            $httpBackend.flush();

            DeconsolidationContractCtrl.cancel();

            expect($uibModalInstanceMock.dismiss).toHaveBeenCalled();
        });
    });
});
