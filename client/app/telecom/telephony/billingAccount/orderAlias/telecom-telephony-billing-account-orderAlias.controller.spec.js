describe("Controller TelecomTelephonyBillingAccountOrderAliasCtrl - ", function () {
    "use strict";

    var $httpBackend;
    var $controller;
    var $scope;
    var $state;
    var AliasOrderController;
    var billingAccount = "bob";
    var TELEPHONY_NUMBER_OFFER;

    // load the controller"s module
    beforeEach(angular.mock.module("managerAppMock"));
    beforeEach(module("telephonyMock"));

    beforeEach(inject(function (_$httpBackend_, $rootScope, _$controller_, _$state_, ssoAuthentication, $translate, $injector, _TELEPHONY_NUMBER_OFFER_) {
        $httpBackend = _$httpBackend_;
        $controller = _$controller_;
        $scope = $rootScope.$new();
        $state = _$state_;
        TELEPHONY_NUMBER_OFFER = _TELEPHONY_NUMBER_OFFER_;
        ssoAuthentication.setIsLoggedIn(true);

    }));

    afterEach(inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        $scope.$destroy();
    }));

    function initNewCtrl (injection) {
        AliasOrderController = $controller("TelecomTelephonyBillingAccountOrderAliasCtrl", injection);
    }

    describe("Redirection", function () {
        beforeEach(function () {
            $httpBackend.whenGET("/2api/telephony/alias/all").respond(
                200,
                [
                    {
                        billingAccount: "toto",
                        aliases: ["alias1", "alias2"]
                    }
                ]
            );
            spyOn($state, "go");
        });

    });

    describe("Get prices", function () {
        var pricesMock = readJSON("client/bower_components/ovh-api-services/src/telephony/number/telephony-number.aapi.service.dt.spec.json").prices;
        beforeEach(function () {
            $httpBackend.whenGET(["/2api/telephony", billingAccount, "number/fr/prices"].join("/")).respond(200, pricesMock);
        });

        it("should redirect when defaults", function () {
            initNewCtrl({
                $scope: $scope,
                $stateParams: {
                    billingAccount: billingAccount,
                    serviceName: "default"
                }
            });

            $httpBackend.flush();
            expect(AliasOrderController.offers.length).toBe(TELEPHONY_NUMBER_OFFER.list.length);
            AliasOrderController.offers.forEach(function (elt) {
                expect(Object.keys(elt)).toContain("withTax");
                expect(Object.keys(elt)).toContain("withoutTax");
                expect(Object.keys(elt)).toContain("tax");
            });
        });

    });

});
