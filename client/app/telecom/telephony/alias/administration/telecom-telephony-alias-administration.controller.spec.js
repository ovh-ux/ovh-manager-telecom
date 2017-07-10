"use strict";

describe("Controller: TelecomTelephonyAliasAdministrationCtrl", function () {
    var scope;

    // load the controller"s module
    beforeEach(angular.mock.module("managerAppMock"));
    beforeEach(module("telephonyMock"));

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        $controller("TelecomTelephonyAliasAdministrationCtrl", { $scope: scope });
    }));

    it("should ...", function () {
        expect(1).toEqual(1);
    });
});
