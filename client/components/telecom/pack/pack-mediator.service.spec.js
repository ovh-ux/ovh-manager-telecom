"use strict";

describe("Service: PackMediator", function () {
    var PackMediator;

    // load the service"s module
    beforeEach(angular.mock.module("managerAppMock"));

    // instantiate service
    beforeEach(inject(function (_PackMediator_) {
        PackMediator = _PackMediator_;
    }));

    it("should do something", function () {
        expect(!!PackMediator).toBe(true);
    });

});
