"use strict";

describe("Controller FreeFax - ", function () {

    var $httpBackend;
    var $controller;
    var scope;
    var ToastErrorSpy;

    var ok = 200;
    var serviceName = "83843843432424";
    var getFreeFaxDetailsUrl = "/2api/freefax/" + serviceName + "/details";
    var successRequestResult = {
        fromName: "Service télécopie",
        redirectionEmail: ["test@ovh.net"],
        number: "1033972250235",
        faxQuality: "normal",
        faxMaxCall: 6,
        fromEmail: "no-reply@ovh.net",
        domain: "domainName@fr",
        faxs: 382,
        points: 765,
        status: "ok"
    };

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
        $httpBackend.whenGET(/translations\/Messages\w+\.json$/).respond(200, {});
        $httpBackend.whenGET("app/home/home.html").respond(200, {});
        $httpBackend.whenGET(/apiv6\/freefax\/.*\/voicemail\/routing$/).respond(200, {});

    }));

    afterEach(inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        scope.$destroy();
    }));

    function initNewCtrl () {
        $controller("FreeFaxCtrl", {
            $stateParams: { serviceName: serviceName },
            $scope: scope,
            ToastError: ToastErrorSpy
        });
    }

    describe("initialization", function () {

        it("should set loading variable to true before request resolve", function () {
            $httpBackend.expectGET(getFreeFaxDetailsUrl).respond(ok, successRequestResult);
            initNewCtrl();

            expect(scope.loading).toBeTruthy();
            $httpBackend.flush();
        });

        describe("success case", function () {
            it("should initialize freeFax variable", function () {
                $httpBackend.expectGET(getFreeFaxDetailsUrl).respond(ok, successRequestResult);
                initNewCtrl();
                $httpBackend.flush();

                expect(scope.freeFax).toBeDefined();
            });

            it("should set loading variable to false", function () {
                $httpBackend.expectGET(getFreeFaxDetailsUrl).respond(ok, successRequestResult);
                initNewCtrl();
                $httpBackend.flush();

                expect(scope.loading).toBeFalsy();
            });
        });

        describe("error case", function () {
            it("should call ToastError", function () {
                $httpBackend.expectGET(getFreeFaxDetailsUrl).respond(500, null);
                initNewCtrl();
                $httpBackend.flush();

            });

            it("should set loading variable to false", function () {
                $httpBackend.expectGET(getFreeFaxDetailsUrl).respond(ok, successRequestResult);
                initNewCtrl();
                $httpBackend.flush();

                expect(scope.loading).toBeFalsy();
            });
        });
    });
});
