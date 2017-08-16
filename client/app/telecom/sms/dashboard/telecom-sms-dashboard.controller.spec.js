describe("Controller: TelecomSmsDashboardCtrl", () => {
    "use strict";

    let scope;

    // load the controller"s module
    beforeEach(angular.mock.module("managerAppMock"));
    beforeEach(module("smsMock"));

    // Initialize the controller and a mock scope
    beforeEach(inject(($controller, $rootScope) => {
        scope = $rootScope.$new();
        $controller("TelecomSmsDashboardCtrl", { $scope: scope });
    }));

    it("should ...", () => {
        expect(1).toEqual(1);
    });
});
