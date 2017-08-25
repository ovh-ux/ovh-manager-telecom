"use strict";

describe("Controller: TelecomTelephonyLineCallsCtrl", function () {
    var TelecomTelephonyLineCallsCtrl;
    var scope;

    // load the controller"s module
    beforeEach(angular.mock.module("managerAppMock"));
    beforeEach(angular.mock.module("telephonyMock"));

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        TelecomTelephonyLineCallsCtrl = $controller("TelecomTelephonyLinePasswordCtrl", { $scope: scope });
    }));

    it("should accept password", function () {
        var classPassword = _.find(TelecomTelephonyLineCallsCtrl.validators, { id: "class" }).validator;
        _.forEach([
            "1234567o",
            "12o34567",
            "1234567_",
            "1_234567",
            "abcdefg_",
            "_abcdefg"
        ], function (password) {
            expect(classPassword(password)).toBeTruthy();
        });
    });
    it("should reject password as it does not melt character types", function () {
        var classPassword = _.find(TelecomTelephonyLineCallsCtrl.validators, { id: "class" }).validator;
        _.forEach([
            "12345678",
            "abcdefgh",
            "#'([)]@="
        ], function (password) {
            expect(classPassword(password)).toBeFalsy();
        });
    });
});
