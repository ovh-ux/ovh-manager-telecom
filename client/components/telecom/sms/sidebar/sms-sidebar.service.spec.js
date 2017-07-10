"use strict";

describe("Service: SmsSidebar", function () {
    var SmsSidebar;

    // load the service"s module
    beforeEach(angular.mock.module("managerAppMock"));

    // instantiate service
    beforeEach(inject(function (_SmsSidebar_) {
        SmsSidebar = _SmsSidebar_;
    }));

    it("should do something", function () {
        expect(!!SmsSidebar).toBe(true);
    });
});
