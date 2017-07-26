"use strict";

describe("Controller: XdslAccessLnsCtrl", function () {

    // load the controller"s module
    beforeEach(angular.mock.module("managerAppMock"));
    var dataLns = readJSON("client/bower_components/ovh-api-services/src/xdsl/availableLns/xdsl-availableLns.service.dt.spec.json");
    var dataXdsl = readJSON("client/bower_components/ovh-api-services/src/xdsl/xdsl.service.dt.spec.json");
    var dataTasks = readJSON("client/bower_components/ovh-api-services/src/xdsl/tasks/current/xdsl-tasks-current.service.dt.spec.json");

    var $httpBackend;
    var $rootScope;
    var $controller;
    var $scope;

    beforeEach(inject(function (_$httpBackend_, _$rootScope_, _$controller_, $injector) {
        /** * APIv6 Auth ***/
        var authentication;
        authentication = $injector.get("ssoAuthentication");
        authentication.setIsLoggedIn(true);

        /******************/

        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $controller = _$controller_;

        $httpBackend.whenGET(/translations\/Messages\w+\.json$/).respond(200, {});
        $httpBackend.whenGET("/apiv6/me").respond(200, {});
        $httpBackend.whenGET("/apiv6/me/paymentMean/creditCard").respond(200, []);
        $httpBackend.whenGET("/apiv6/me/paymentMean/paypal").respond(200, []);
        $httpBackend.whenGET("/apiv6/me/paymentMean/bankAccount?state=valid").respond(200, []);
        $httpBackend.whenGET("/2api/me/ovhAccount/all").respond(200, []);
        $httpBackend.whenGET("app/home/home.html").respond(200, {});

        $scope = $rootScope.$new();
    }));

    afterEach(inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        $scope.$destroy();
    }));

    //-----

    var XdslAccessLnsCtrl;
    var xdslPack = "xdsl-ja7736-3";

    function initNewCtrl () {

        $scope.access = {
            xdsl: dataXdsl.success,
            tasks: {
                current: dataTasks.success.data
            }
        };

        XdslAccessLnsCtrl = $controller("XdslAccessLnsCtrl", {
            $scope: $scope,
            $stateParams: { serviceName: xdslPack }
        });

    }

    //-----

    describe("- LNS -", function () {

        beforeEach(function () {
            initNewCtrl(xdslPack);
            $httpBackend.flush();
        });

        it(" change the lns ", function () {
            XdslAccessLnsCtrl.currentLnsTmp = dataLns.lns.get[1];
            $httpBackend.whenPOST("/apiv6/xdsl/" + xdslPack + "/changeLns").respond(200, dataLns.lns.post);
            XdslAccessLnsCtrl.changeLns();
            $httpBackend.flush();

            expect(XdslAccessLnsCtrl.currentLns.city).toBe("Paris");
            expect($scope.access.tasks.current.lnsChange).toBe(true);
        });

    });

});
