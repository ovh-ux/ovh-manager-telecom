angular.module("managerApp").service("jsPlumbService", function ($q) {
    "use strict";

    var self = this;

    var jsPlumbReadyDefered = $q.defer();

    self.initJsPlumb = function () {
        jsPlumb.ready(function () {
            jsPlumbReadyDefered.resolve();
        });

        return jsPlumbReadyDefered.promise;
    };

});
