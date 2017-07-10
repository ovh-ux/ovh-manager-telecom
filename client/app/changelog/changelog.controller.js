angular.module("managerApp")
    .controller("ChangelogCtrl", function (Changelog, ToastError) {
        "use strict";

        var self = this;

        self.content = null;

        Changelog.Aapi().query().$promise.then(
            function (content) {
                self.content = content;
            },
            ToastError
        );

    });
