"use strict";

describe("Controller: XdslAccessCtrl", function () {

    var dataXdsl = readJSON("client/bower_components/ovh-api-services/src/xdsl/xdsl.service.dt.spec.json");
    var dataTasks = readJSON("client/bower_components/ovh-api-services/src/xdsl/tasks/current/xdsl-tasks-current.service.dt.spec.json");
    var dataIps = readJSON("client/bower_components/ovh-api-services/src/xdsl/ips/xdsl-ips.service.dt.spec.json");
    var dataNotifications = readJSON("client/bower_components/ovh-api-services/src/xdsl/notifications/xdsl-notifications.service.dt.spec.json");
    var dataLines = readJSON("client/bower_components/ovh-api-services/src/xdsl/lines/xdsl-lines.service.dt.spec.json");
    var dataOrder = readJSON("client/bower_components/ovh-api-services/src/xdsl/order/xdsl-order.service.dt.spec.json");

    // load the controller"s module
    beforeEach(angular.mock.module("managerAppMock"));

    var $httpBackend;
    var $rootScope;
    var $controller;
    var $scope;
    var $uibModal;

    var XdslAccessCtrl;
    var xdslPack = "xdsl-ja7736-3";
    var number = "0102030504";
    var modalSpy = {
        result: {
            then: angular.noop
        }
    };

    function mockHttpCalls () {
        $httpBackend.whenGET(/translations\/Messages\w+\.json$/).respond(200, {});
        $httpBackend.whenGET("/apiv6/me").respond(200, {});
        $httpBackend.whenGET("/apiv6/me/paymentMean/creditCard").respond(200, []);
        $httpBackend.whenGET("/apiv6/me/paymentMean/paypal").respond(200, []);
        $httpBackend.whenGET("/apiv6/me/paymentMean/bankAccount?state=valid").respond(200, []);
        $httpBackend.whenGET("/2api/me/ovhAccount/all").respond(200, []);
        $httpBackend.whenGET("/apiv6/xdsl/" + xdslPack).respond(200, dataXdsl.success);
        $httpBackend.whenGET("/apiv6/xdsl/" + xdslPack + "/lines/" + number).respond(200, dataLines.query.success);
        $httpBackend.whenGET("/2api/xdsl/" + xdslPack + "/tasks/current").respond(200, dataTasks);
        $httpBackend.whenGET("/2api/xdsl/" + xdslPack + "/ips").respond(200, dataIps.get.success);
        $httpBackend.whenGET("/apiv6/xdsl/" + xdslPack + "/monitoringNotifications").respond(200, dataNotifications.get.success.notifications);
        $httpBackend.whenGET("/apiv6/xdsl/" + xdslPack + "/orderFollowup").respond(200, dataOrder);
        $httpBackend.whenGET("/apiv6/xdsl/" + xdslPack + "/statistics?period=monthly&type=traffic:download").respond(200, dataXdsl.statisticsDownload);
        $httpBackend.whenGET("/apiv6/xdsl/" + xdslPack + "/statistics?period=monthly&type=traffic:upload").respond(200, dataXdsl.statisticsUpload);
        $httpBackend.whenGET("/apiv6/xdsl/" + xdslPack + "/modem").respond(200, { macAddress: "" });
        $httpBackend.whenGET("/apiv6/pack/xdsl/tasks?function=pendingAddressMove").respond(200, []);
        $httpBackend.whenGET("app/home/home.html").respond(200, {});
    }

    beforeEach(inject(function (_$httpBackend_, _$rootScope_, _$controller_, _$uibModal_, $injector) {
        /** * APIv6 Auth ***/
        var authentication;
        authentication = $injector.get("ssoAuthentication");
        authentication.setIsLoggedIn(true);

        /******************/

        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $controller = _$controller_;
        $uibModal = _$uibModal_;

        mockHttpCalls();

        $scope = $rootScope.$new();
    }));

    afterEach(inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        $scope.$destroy();
    }));

    //-----

    function initNewCtrl (pack, numberid) {
        XdslAccessCtrl = $controller("XdslAccessCtrl", {
            $scope: $scope,
            $stateParams: { serviceName: pack, number: numberid },
            $uibModal: $uibModal
        });
    }

    //-----

    describe("- Initialization controller in success case -", function () {
        beforeEach(function () {
            initNewCtrl(xdslPack, number);
            $httpBackend.flush();
        });

        it("should set the values", function () {
            expect($scope.access.tasks.current).toEqual(dataTasks.data);

            expect($scope.loaders.details).toBe(false);
        });

    });

    describe("orderIps", function () {
        beforeEach(function () {
            spyOn($uibModal, "open").and.returnValue(modalSpy);
            initNewCtrl(xdslPack, number);
            $httpBackend.flush();
        });

        it("should open a new modal window", function () {
            XdslAccessCtrl.orderIps();
            expect($uibModal.open).toHaveBeenCalled();
        });
    });
});
