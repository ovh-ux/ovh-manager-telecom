"use strict";

describe("Controller: XdslModemFirewallCtrl", function () {

    // load the controller"s module
    beforeEach(angular.mock.module("managerAppMock"));

    var dataXdslModem = readJSON("client/bower_components/ovh-api-services/src/xdsl/modem/xdsl-modem.service.dt.spec.json");
    var dataXdsl = readJSON("client/bower_components/ovh-api-services/src/xdsl/xdsl.service.dt.spec.json");
    var dataTasks = readJSON("client/bower_components/ovh-api-services/src/xdsl/tasks/current/xdsl-tasks-current.service.dt.spec.json");

    var $httpBackend;
    var $rootScope;
    var $controller;
    var $scope;
    var PackXdslModemMediator;

    beforeEach(inject(function (_$httpBackend_, _$rootScope_, _$controller_, $injector, _PackXdslModemMediator_) {
        /** * APIv6 Auth ***/
        var authentication;
        authentication = $injector.get("ssoAuthentication");
        authentication.setIsLoggedIn(true);

        /******************/

        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $controller = _$controller_;
        PackXdslModemMediator = _PackXdslModemMediator_;

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

    var XdslModemFirewallCtrl;
    var xdslPack = "xdsl-ja7736-3";

    var initNewCtrl = function () {

        $scope.access = {
            xdsl: dataXdsl.success
        };

        PackXdslModemMediator.disableCapabilities = angular.noop;
        PackXdslModemMediator.capabilities.canChangeEasyFirewallLevel = true;

        $scope.modem = {
            info: JSON.parse(JSON.stringify(dataXdslModem.modem)),
            tasks: JSON.parse(JSON.stringify(dataTasks.success.data))
        };

        XdslModemFirewallCtrl = $controller("XdslModemFirewallCtrl", {
            $scope: $scope,
            $stateParams: { serviceName: xdslPack },
            PackXdslModemMediator: PackXdslModemMediator
        });

    };

    describe("- Firewall -", function () {
        beforeEach(function () {
            initNewCtrl(xdslPack);
            $httpBackend.flush();
        });

        it(" find the current firewall level ", function () {
            expect(XdslModemFirewallCtrl.firewallCurrentLevelTmp.name).toBe("Normal");
            expect(XdslModemFirewallCtrl.getDisplayValue()).toBe("Normal");
        });

        it(" change the firewall level ", function () {
            XdslModemFirewallCtrl.firewallCurrentLevelTmp = { name: "BlockAll" };
            $httpBackend.whenPUT("/apiv6/xdsl/" + xdslPack + "/modem").respond(200, dataXdslModem.firewall.put.success);
            XdslModemFirewallCtrl.changeFirewallLevel();
            $httpBackend.flush();

            expect(XdslModemFirewallCtrl.firewallCurrentLevel.name).toBe("BlockAll");
        });

        it(" cannot change the firewall level ", function () {
            XdslModemFirewallCtrl.firewallCurrentLevelTmp = { name: "BlockAll" };
            $httpBackend.whenPUT("/apiv6/xdsl/" + xdslPack + "/modem").respond(403, dataXdslModem.firewall.put.error);
            XdslModemFirewallCtrl.changeFirewallLevel();
            $httpBackend.flush();

            expect(XdslModemFirewallCtrl.firewallCurrentLevel.name).toBe("Normal");
            expect(XdslModemFirewallCtrl.firewallCurrentLevelTmp.name).toBe("Normal");
            expect($scope.modem.tasks.changeModemConfigEasyFirewallLevel).toBeUndefined();
        });

    });

});
