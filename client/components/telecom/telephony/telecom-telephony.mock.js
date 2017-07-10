angular.module("telephonyMock", []);

angular.module("telephonyMock").run(function ($q, $httpBackend, TelephonyMediator) {
    "use strict";

    TelephonyMediator.initDeferred = $q.defer();

    $httpBackend.whenGET("app/home/home.html").respond(200, {});
    $httpBackend.whenGET("/apiv6/me").respond(200, { country: "FR" });
    $httpBackend.whenGET("/apiv6/me/paymentMean/creditCard").respond(200, []);
    $httpBackend.whenGET("/apiv6/me/paymentMean/paypal").respond(200, []);
    $httpBackend.whenGET("/apiv6/me/paymentMean/bankAccount?state=valid").respond(200, []);
    $httpBackend.whenGET("/2api/me/ovhAccount/all").respond(200, []);
    $httpBackend.whenGET(/translations\/Messages\w+\.json$/).respond(200, {});

});
