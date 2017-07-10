"use strict";

angular.module("telecomMock", []);

angular.module("telecomMock").run(function ($q, TelecomMediator) {

    TelecomMediator.deferred = {
        vip: $q.defer(),
        count: $q.defer()
    };

});
