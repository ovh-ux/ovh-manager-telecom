"use strict";

describe("Service: TelephonySidebar", function () {
    var TelephonySidebar;

    // load the service"s module
    beforeEach(angular.mock.module("managerAppMock"));

    // instantiate service
    beforeEach(inject(function (_TelephonySidebar_) {
        TelephonySidebar = _TelephonySidebar_;
    }));

    it("should do something", function () {
        expect(!!TelephonySidebar).toBe(true);
    });

});
