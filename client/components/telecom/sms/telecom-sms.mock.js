angular.module("smsMock", []);

angular.module("smsMock").run(function ($q, $httpBackend, SmsMediator) {
    "use strict";

    SmsMediator.initDeferred = $q.defer();

    // TODO : do it better :-)
    $httpBackend.whenGET(/\/2api\/.+/).respond(200, {});
    $httpBackend.whenGET(/\/apiv6\/.+/).respond(200, {});

});
