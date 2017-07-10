"use strict";

describe("Service: PackSidebar", function () {
    var PackSidebar;

    // load the service"s module
    beforeEach(angular.mock.module("managerAppMock"));

    // instantiate service
    beforeEach(inject(function (_PackSidebar_) {
        PackSidebar = _PackSidebar_;
    }));

    it("should do something", function () {
        expect(!!PackSidebar).toBe(true);
    });
});
