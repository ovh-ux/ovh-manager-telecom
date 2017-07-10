"use strict";

describe("Controller XdslDeconsolidationCtrl - ", function () {

    var $controller;
    var scope;
    var ToastSpy;
    var stateSpy;
    var $uibModal;
    var modalMock;
    var $httpBackend;
    var ok = 200;
    var packName = "83843843432424";

    // load the controller"s module
    beforeEach(angular.mock.module("managerAppMock"));

    beforeEach(inject(function ($rootScope, _$controller_, _$uibModal_,
                                $state, Toast, ssoAuthentication, _$httpBackend_) {
        $controller = _$controller_;
        scope = $rootScope.$new();
        scope.access = {
            xdsl: {
                accesName: packName
            },
            tasks: {
                current: {
                }
            }
        };

        stateSpy = $state;
        ToastSpy = Toast;
        spyOn(ToastSpy, "success");

        $uibModal = _$uibModal_;
        initializeMockModal();

        ssoAuthentication.setIsLoggedIn(true);
        $httpBackend = _$httpBackend_;
        $httpBackend.whenGET("app/home/home.html").respond(200, {});
        $httpBackend.whenGET("/apiv6/me").respond(ok, {});
        $httpBackend.whenGET("/apiv6/me/paymentMean/creditCard").respond(ok, []);
        $httpBackend.whenGET("/apiv6/me/paymentMean/paypal").respond(ok, []);
        $httpBackend.whenGET("/apiv6/me/paymentMean/bankAccount?state=valid").respond(ok, []);
        $httpBackend.whenGET("/2api/me/ovhAccount/all").respond(ok, []);
        $httpBackend.whenGET("app/home/home.html").respond(200, {});
        $httpBackend.whenGET(/translations\/Messages\w+\.json$/).respond(ok, {});
        $httpBackend.whenGET("/2api/pack/xdsl/" + packName + "/tasks/detail").respond(ok, []);
        $httpBackend.whenGET("/apiv6/pack/xdsl/" + packName).respond(ok, {
            capabilities: {
                isLegacyOffer: true
            }
        });

    }));

    afterEach(inject(function () {
        scope.$destroy();
    }));

    var controller;
    function initNewCtrl () {
        controller = $controller("XdslDeconsolidationCtrl", {
            $scope: scope,
            $state: stateSpy,
            Toast: ToastSpy,
            $uibModal: $uibModal,
            $stateParams: { packName: packName },
            $timeout: function (myFunction) { myFunction(); }
        });
    }

    describe("init", function () {
        it("should initialize isLegacyOffer", function () {
            initNewCtrl();
            $httpBackend.flush();

            expect(controller.isLegacyOffer).toBeTruthy();
        });
    });

    describe("openConfirmModal", function () {
        it("should open modal window", function () {
            initNewCtrl();
            $httpBackend.flush();

            controller.openConfirmModal();
            expect($uibModal.open).toHaveBeenCalled();
        });

        it("should configure success callback", function () {
            initNewCtrl();
            $httpBackend.flush();

            controller.openConfirmModal();
            expect(modalMock.result.then).toHaveBeenCalled();
        });

        describe("success callback", function () {
            it("should call Toast", function () {
                initNewCtrl();
                $httpBackend.flush();

                controller.openConfirmModal();
                expect(ToastSpy.success).toHaveBeenCalled();
            });

            it("should return to 'telecom.pack.xdsl' state", function () {
                spyOn(stateSpy, "go").and.callFake(angular.noop);

                initNewCtrl();
                $httpBackend.flush();

                controller.openConfirmModal();
                expect(stateSpy.go).toHaveBeenCalledWith("telecom.pack.xdsl");
            });
        });
    });

    function initializeMockModal () {
        modalMock = {
            result: {
                then: angular.noop
            }
        };
        spyOn($uibModal, "open").and.callFake(function () {
            return modalMock;
        });
        spyOn(modalMock.result, "then").and.callFake(function (result) {
            result({ status: "todo" });
        });
    }
});
