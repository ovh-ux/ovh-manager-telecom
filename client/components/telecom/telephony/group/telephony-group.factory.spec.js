"use strict";

describe("Service: TelephonyGroup", function () {
    var TelephonyGroup;

    // load the service"s module
    beforeEach(angular.mock.module("managerAppMock"));

    // instantiate service
    beforeEach(inject(function (_TelephonyGroup_) {
        TelephonyGroup = _TelephonyGroup_;
    }));

    it("should do something", function () {
        expect(!!TelephonyGroup).toBe(true);
    });
});
