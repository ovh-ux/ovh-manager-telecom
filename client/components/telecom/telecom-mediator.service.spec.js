"use strict";

describe("Service: TelecomMediator", function () {
    var TelecomMediator;

    // load the service"s module
    beforeEach(angular.mock.module("managerApp"));
    beforeEach(angular.mock.module("managerAppMock"));

    // instantiate service
    beforeEach(inject(function (_TelecomMediator_) {
        TelecomMediator = _TelecomMediator_;
    }));

    it("should do something", function () {
        expect(!!TelecomMediator).toBe(true);
    });
});
