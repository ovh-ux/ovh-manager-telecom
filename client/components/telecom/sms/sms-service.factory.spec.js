describe("Service: SmsService", function () {
    "use strict";

    var SmsService;

    // load the service's module
    beforeEach(angular.mock.module("managerAppMock"));

    // instantiate service
    beforeEach(inject(function (_SmsService_) {
        SmsService = _SmsService_;
    }));

    it("should do something", function () {
        expect(!!SmsService).toBe(true);
    });
});
