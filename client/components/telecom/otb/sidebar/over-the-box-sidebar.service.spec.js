"use strict";

describe("Service: OverTheBoxSidebar", function () {
    var OverTheBoxSidebar;

    // load the service"s module
    beforeEach(angular.mock.module("managerAppMock"));

    // instantiate service
    beforeEach(inject(function (_OverTheBoxSidebar_) {
        OverTheBoxSidebar = _OverTheBoxSidebar_;
    }));

    it("should do something", function () {
        expect(!!OverTheBoxSidebar).toBe(true);
    });
});
