angular.module("managerApp")
    .controller("ChangelogCtrl", function (OvhApiChangelog, ToastError) {
        "use strict";

        var self = this;

        self.content = null;

        OvhApiChangelog.Aapi().query().$promise.then(
            function (content) {
                self.content = content;
            },
            ToastError
        );

    });
