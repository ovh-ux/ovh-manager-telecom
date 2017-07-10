"use strict";

describe("Service: FaxSidebar", function () {
    var FaxSidebar;

    // load the service"s module
    beforeEach(angular.mock.module("managerAppMock"));

    // instantiate service
    beforeEach(inject(function (_FaxSidebar_) {
        FaxSidebar = _FaxSidebar_;
    }));

    it("should do something", function () {
        expect(!!FaxSidebar).toBe(true);
    });

});
