"use strict";

describe("Factory: TelephonyGroupFax", function () {
    var TelephonyGroupFax;

    // load the service"s module
    beforeEach(angular.mock.module("managerAppMock"));

    // instantiate service
    beforeEach(inject(function (_TelephonyGroupFax_) {
        TelephonyGroupFax = _TelephonyGroupFax_;
    }));

    it("should do something", function () {
        expect(!!TelephonyGroupFax).toBe(true);
    });
});
