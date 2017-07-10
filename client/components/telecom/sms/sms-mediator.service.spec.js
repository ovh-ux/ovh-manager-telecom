describe("Service: SmsMediator", function () {
    "use strict";

    var SmsMediator;

    // load the service"s module
    beforeEach(angular.mock.module("managerAppMock"));

    // instantiate service
    beforeEach(inject(function (_SmsMediator_) {
        SmsMediator = _SmsMediator_;
    }));

    it("should do something", function () {
        expect(!!SmsMediator).toBe(true);
    });

});
