"use strict";

describe("Controller: TelecomTelephonyBillingAccountBillingCreditThresholdCtrl", function () {
    var scope;

    // load the controller"s module
    beforeEach(angular.mock.module("managerAppMock"));
    beforeEach(module("telephonyMock"));

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        $controller("TelecomTelephonyBillingAccountBillingCreditThresholdCtrl", { $scope: scope });
    }));

    it("should ...", function () {
        expect(1).toEqual(1);
    });

    /*
    it("should add a new deposit amount to the current deposit amount", function () {
        TelecomTelephonyBillingAccountBillingDepositCtrl.currentDepositWithoutTax = 10;
        TelecomTelephonyBillingAccountBillingDepositCtrl.amount = {
            value: {
                withoutTax: 20
            }
        };
        TelecomTelephonyBillingAccountBillingDepositCtrl.changeAmount();
        expect(TelecomTelephonyBillingAccountBillingDepositCtrl.futureDepositWithoutTax).toEqual(30);
    });
    */
});
