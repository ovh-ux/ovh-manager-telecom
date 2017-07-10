"use strict";

describe("Service: TelephonyMediator", function () {
    var TelephonyMediator;

    // load the service"s module
    beforeEach(angular.mock.module("managerAppMock"));

    // instantiate service
    beforeEach(inject(function (_TelephonyMediator_) {
        TelephonyMediator = _TelephonyMediator_;
    }));

    it("should do something", function () {
        expect(!!TelephonyMediator).toBe(true);
    });

});
