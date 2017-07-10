"use strict";

describe("Factory: TelephonyGroupLine", function () {
    var TelephonyGroupLine;

    // load the service"s module
    beforeEach(angular.mock.module("managerAppMock"));

    // instantiate service
    beforeEach(inject(function (_TelephonyGroupLine_) {
        TelephonyGroupLine = _TelephonyGroupLine_;
    }));

    it("should do something", function () {
        expect(!!TelephonyGroupLine).toBe(true);
    });
});
