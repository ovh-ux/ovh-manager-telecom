"use strict";

angular.module("managerAppMock", ["managerApp", "templates"]);

angular.module("managerAppMock").run(function ($q, $httpBackend, TelecomMediator) {

    /* ----------  TRANSLATIONS FILES MOCKS  ----------*/
    $httpBackend.whenGET(/translations\/Messages\w+\.json$/).respond(200, {});

    /* ----------  MISC MOCKS  ----------*/
    $httpBackend.whenGET("/engine/api/me").respond(200, {});
    $httpBackend.whenGET("/bower_components/angular-i18n/angular-locale_en-us.js").respond(200, "");
    $httpBackend.whenGET("/assets/images/raptor.png").respond(200, null);

    /* ----------  APIV6 MOCKS  ----------*/
    $httpBackend.whenGET(/^\/apiv\d+\/xdsl\?accessType:eq=sdsl&status:ne=deleting$/).respond(200, []);
    $httpBackend.whenGET(/^\/apiv\d+\/xdsl\?status:ne=deleting$/).respond(200, []);
    $httpBackend.whenGET(/^\/apiv\d+\/pack\/xdsl$/).respond(200, []);
    $httpBackend.whenGET(/^\/pack\/xdsl$/).respond(200, []);
    $httpBackend.whenGET(/^\/xdsl/).respond(200, []);
    $httpBackend.whenGET(/^\/freefax/).respond(200, []);
    $httpBackend.whenGET(/^\/apiv\d+\/telephony$/).respond(200, []);
    $httpBackend.whenGET(/^\/apiv\d+\/sms$/).respond(200, []);
    $httpBackend.whenGET(/^\/apiv\d+\/freefax$/).respond(200, []);
    $httpBackend.whenGET(/^\/apiv\d+\/overTheBox$/).respond(200, []);
    $httpBackend.whenGET(/^\/apiv7\/pack\/xdsl/).respond(200, []);
    $httpBackend.whenGET(/^\/apiv7\/telephony/).respond(200, []);

    /* ----------  2API MOCKS  ----------*/
    $httpBackend.whenGET("/2api/telecom/sidebar/count").respond(200, {});
    $httpBackend.whenGET("/2api/fax").respond(200, []);
    $httpBackend.whenGET("/2api/sms/details").respond(200, []);
    $httpBackend.whenGET(/2api\/me\/alerts/).respond(200, []);
    $httpBackend.whenGET(/2api\/notification/).respond(200, []);

    /* ----------  WS MOCKS  ----------*/
    $httpBackend.whenGET(/ws/).respond(200, {});

    /* ----------  SERVICES INITIALIZATION  ----------*/
    TelecomMediator.deferred.vip = $q.defer();
    TelecomMediator.deferred.count = $q.defer();

});
