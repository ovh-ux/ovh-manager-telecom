"use strict";

describe("Controller FreeFaxConfiguration - ", function () {

    var $httpBackend;
    var $controller;
    var scope;
    var ToastErrorSpy;
    var translate;

    var ok = 200;
    var serviceName = "83843843432424";
    var postFormUrl = "/apiv6/freefax/" + serviceName;

    // load the controller"s module
    beforeEach(angular.mock.module("managerAppMock"));

    beforeEach(inject(function (_$httpBackend_, $rootScope, _$controller_, $translate, $injector) {
        $httpBackend = _$httpBackend_;
        $controller = _$controller_;
        scope = $rootScope.$new();
        translate = $translate;
        ToastErrorSpy = jasmine.createSpy("ToastError");
        var ssoAuthentication = $injector.get("ssoAuthentication");
        ssoAuthentication.setIsLoggedIn(true);

        $httpBackend.whenGET("app/home/home.html").respond(200, {});
        $httpBackend.whenGET("/apiv6/me").respond(200, {});
        $httpBackend.whenGET("/apiv6/me/paymentMean/creditCard").respond(200, []);
        $httpBackend.whenGET("/apiv6/me/paymentMean/paypal").respond(200, []);
        $httpBackend.whenGET("/apiv6/me/paymentMean/bankAccount?state=valid").respond(200, []);
        $httpBackend.whenGET("/2api/me/ovhAccount/all").respond(200, []);
        $httpBackend.whenGET(/translations\/Messages\w+\.json$/).respond(200, {});
    }));

    afterEach(inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        scope.$destroy();
    }));

    var FreeFaxConfigurationController;
    function initNewCtrl () {
        FreeFaxConfigurationController = $controller("FreeFaxConfigurationCtrl", {
            $stateParams: { serviceName: serviceName },
            $scope: scope,
            ToastError: ToastErrorSpy
        });
    }

    describe("initialization", function () {
        beforeEach(function () {
            scope.freeFax = {
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
        });

        it("should initialize max request constant", function () {
            var expected = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            initNewCtrl();

            expect(FreeFaxConfigurationController.maxRequestsOptions).toEqual(expected);

            $httpBackend.flush();
        });

        it("should initialize quality constant", function () {
            var expected = [
                {
                    value: "normal",
                    label: translate.instant("freefax_quality_normal")
                },
                {
                    value: "high",
                    label: translate.instant("freefax_quality_high")
                },
                {
                    value: "best",
                    label: translate.instant("freefax_quality_best")
                }
            ];

            initNewCtrl();

            expect(FreeFaxConfigurationController.qualityOptions).toEqual(expected);

            $httpBackend.flush();
        });

        it("should set editMode to false", function () {
            initNewCtrl();
            expect(FreeFaxConfigurationController.editMode).toBeFalsy();
            $httpBackend.flush();
        });
    });

    describe("enterEditMode", function () {
        beforeEach(function () {
            scope.freeFax = {
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
        });

        it("should enter edit mode", function () {
            initNewCtrl();

            FreeFaxConfigurationController.enterEditMode();

            expect(FreeFaxConfigurationController.editMode).toBeTruthy();
            $httpBackend.flush();
        });
    });

    describe("cancelEditMode", function () {
        beforeEach(function () {
            scope.freeFax = {
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
        });

        it("should cancel edit mode", function () {
            initNewCtrl();
            FreeFaxConfigurationController.enterEditMode();

            FreeFaxConfigurationController.cancelEditMode();

            expect(FreeFaxConfigurationController.editMode).toBeFalsy();
            $httpBackend.flush();
        });

        it("should restore old form data", function () {
            initNewCtrl();
            FreeFaxConfigurationController.enterEditMode();
            scope.freeFax.faxMaxCall = 2;
            scope.freeFax.fromName = "test";
            scope.freeFax.fromEmail = "test@test.com";
            scope.freeFax.faxQuality = "high";

            FreeFaxConfigurationController.cancelEditMode();

            expect(scope.freeFax.faxMaxCall).toEqual(6);
            expect(scope.freeFax.fromName).toEqual("Service télécopie");
            expect(scope.freeFax.fromEmail).toEqual("no-reply@ovh.net");
            expect(scope.freeFax.faxQuality).toEqual("normal");
            $httpBackend.flush();
        });
    });

    describe("submit", function () {
        beforeEach(function () {
            scope.freeFax = {
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
        });

        it("should set the loading state to true before the call resolve", function () {
            $httpBackend.expectPUT(postFormUrl).respond(ok, null);
            initNewCtrl();

            FreeFaxConfigurationController.enterEditMode();
            FreeFaxConfigurationController.submit();
            expect(FreeFaxConfigurationController.loading).toBeTruthy();
            $httpBackend.flush();
        });

        describe("success case", function () {
            it("should send the form data", function () {
                $httpBackend.expectPUT(postFormUrl).respond(ok, null);
                initNewCtrl();

                FreeFaxConfigurationController.enterEditMode();
                FreeFaxConfigurationController.submit();
                $httpBackend.flush();
            });

            it("should set the loading state to false", function () {
                $httpBackend.expectPUT(postFormUrl).respond(ok, null);
                initNewCtrl();

                FreeFaxConfigurationController.enterEditMode();
                FreeFaxConfigurationController.submit();
                $httpBackend.flush();

                expect(FreeFaxConfigurationController.loading).toBeFalsy();
            });

            it("should cancel the edit mode", function () {
                $httpBackend.expectPUT(postFormUrl).respond(ok, null);
                initNewCtrl();

                FreeFaxConfigurationController.enterEditMode();
                FreeFaxConfigurationController.submit();
                $httpBackend.flush();

                expect(FreeFaxConfigurationController.editMode).toBeFalsy();
            });
        });

        describe("error case", function () {
            it("should use ToastError", function () {
                $httpBackend.expectPUT(postFormUrl).respond(500, null);
                initNewCtrl();

                FreeFaxConfigurationController.enterEditMode();
                FreeFaxConfigurationController.submit();
                $httpBackend.flush();

                expect(ToastErrorSpy).toHaveBeenCalled();
            });

            it("should set the loading state to false", function () {
                $httpBackend.expectPUT(postFormUrl).respond(500, null);
                initNewCtrl();

                FreeFaxConfigurationController.enterEditMode();
                FreeFaxConfigurationController.submit();
                $httpBackend.flush();

                expect(FreeFaxConfigurationController.loading).toBeFalsy();
            });

            it("should not cancel the edit mode", function () {
                $httpBackend.expectPUT(postFormUrl).respond(500, null);
                initNewCtrl();

                FreeFaxConfigurationController.enterEditMode();
                FreeFaxConfigurationController.submit();
                $httpBackend.flush();

                expect(FreeFaxConfigurationController.editMode).toBeTruthy();
            });
        });

    });
});
