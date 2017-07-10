"use strict";

describe("Service: FaxMediator", function () {
    var OverTheBoxMediator;

    // load the service"s module
    beforeEach(angular.mock.module("managerAppMock"));

    // instantiate service
    beforeEach(inject(function (_OverTheBoxMediator_) {
        OverTheBoxMediator = _OverTheBoxMediator_;
    }));

    it("should do something", function () {
        expect(!!OverTheBoxMediator).toBe(true);
    });

});
