"use strict";

describe("Controller PackTask - ", function () {

    var $controller;
    var scope;
    var ToastErrorSpy;
    var $httpBackend;
    var controller;
    var ok = 200;
    var error = 500;
    var serviceName = "83843843432424";
    var apiResultMock = [
        { "function": "createTelephonyLine", updateDate: "2015-11-18T17:11:43+01:00", status: "todo", id: 7811567 },
        { "function": "createFax", updateDate: "2015-11-18T17:10:05+01:00", status: "done", id: 7739510 }
    ];

    // load the controller"s module
    beforeEach(angular.mock.module("managerAppMock"));

    beforeEach(inject(function ($rootScope, _$controller_, ssoAuthentication, _$httpBackend_) {
        $controller = _$controller_;
        scope = $rootScope.$new();
        $httpBackend = _$httpBackend_;
        ToastErrorSpy = jasmine.createSpy("ToastError");
        $httpBackend.whenGET("/apiv6/me").respond(200, {});
        $httpBackend.whenGET("/2api/me/ovhAccount/all").respond(200, []);
        $httpBackend.whenGET("/apiv6/me/paymentMean/creditCard").respond(200, []);
        $httpBackend.whenGET("/apiv6/me/paymentMean/paypal").respond(200, []);
        $httpBackend.whenGET("/apiv6/me/paymentMean/bankAccount?state=valid").respond(200, []);
        $httpBackend.whenGET(/translations\/Messages\w+\.json$/).respond(200, {});
        $httpBackend.whenGET("app/home/home.html").respond(200, {});
        ssoAuthentication.setIsLoggedIn(true);

        scope.Pack = {
            pack: {
                packName: serviceName
            }
        };
    }));

    afterEach(inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        scope.$destroy();
    }));

    function initNewCtrl () {
        controller = $controller("PackTaskCtrl", {
            $scope: scope,
            ToastError: ToastErrorSpy
        });
    }

    describe("initialization", function () {
        beforeEach(function () {
            $httpBackend.whenGET("/2api/pack/xdsl/" + serviceName + "/tasks/detail").respond(ok, apiResultMock);
        });

        it("should initialize allTasks object", function () {
            initNewCtrl();
            $httpBackend.flush();

            expect(controller.allTasks.length).toBe(apiResultMock.length);
        });

        it("should initialize status object inside tasks", function () {
            initNewCtrl();
            $httpBackend.flush();

            controller.allTasks.forEach(function (task) {
                expect(task.status.tip).toBeDefined();
                expect(task.status.name).toBeDefined();
            });
        });

        it("should initialize statusFilteredTasks to all tasks", function () {
            initNewCtrl();
            $httpBackend.flush();

            expect(controller.statusFilteredTasks).toEqual(controller.allTasks);
        });
    });

    describe("initialisation on http error", function () {
        beforeEach(function () {
            $httpBackend.whenGET("/2api/pack/xdsl/" + serviceName + "/tasks/detail").respond(error, apiResultMock);
        });

        it("should throw toastError", function () {
            initNewCtrl();
            $httpBackend.flush();

            expect(ToastErrorSpy).toHaveBeenCalled();
        });
    });

    describe("updateFilteredTasks", function () {
        beforeEach(function () {
            $httpBackend.whenGET("/2api/pack/xdsl/" + serviceName + "/tasks/detail").respond(ok, apiResultMock);
        });

        it("should only display tasks of filter status", function () {
            var status = "done";
            initNewCtrl();
            $httpBackend.flush();
            controller.filter.status = status;

            controller.updateFilteredTasks();

            expect(controller.statusFilteredTasks.length).toEqual(1);
            expect(controller.statusFilteredTasks[0].status.name).toEqual(status);
        });
    });

    describe("getStatusFilter", function () {
        beforeEach(function () {
            $httpBackend.whenGET("/2api/pack/xdsl/" + serviceName + "/tasks/detail").respond(ok, apiResultMock);
        });

        it("should return all status filters", function () {
            var amountStatus = 6;
            initNewCtrl();
            $httpBackend.flush();

            var result = controller.getStatusFilter();

            expect(result.length).toEqual(amountStatus + 1);
        });
    });

    describe("filterTasksByStatus", function () {
        beforeEach(function () {
            $httpBackend.whenGET("/2api/pack/xdsl/" + serviceName + "/tasks/detail").respond(ok, apiResultMock);
        });

        it("should set filter to status to specified", function () {
            var status = {
                status: "todo"
            };

            initNewCtrl();
            controller.updateFilteredTasks = angular.noop;
            $httpBackend.flush();

            controller.filterTasksByStatus(status);

            expect(controller.filter.status).toBe(status.status);
        });
    });
});
