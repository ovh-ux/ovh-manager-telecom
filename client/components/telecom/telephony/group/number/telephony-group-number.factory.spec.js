"use strict";

describe("Factory: TelephonyGroupNumber", function () {
    var TelephonyGroupNumber;

    // load the service"s module
    beforeEach(angular.mock.module("managerAppMock"));

    // instantiate service
    beforeEach(inject(function (_TelephonyGroupNumber_) {
        TelephonyGroupNumber = _TelephonyGroupNumber_;
    }));

    it("should do something", function () {
        expect(!!TelephonyGroupNumber).toBe(true);
    });
});
