"use strict";

describe("Controller: XdslOrderFollowUpCtrl", function () {

    // load the controller"s module
    beforeEach(angular.mock.module("managerAppMock"));

    var scope;
    var routeParams;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope, $stateParams, _Xdsl_) {
        scope = $rootScope.$new();
        routeParams = $stateParams;
        delete routeParams.id;

        $controller("XdslOrderFollowUpCtrl", {
            $scope: scope,
            Xdsl: _Xdsl_
        });
    }));

});
