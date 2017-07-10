angular.module("managerApp").service("ToastError", function ($translate, $q, Toast) {
    "use strict";

    return function (err, translationId) {
        var output = [$translate.instant(translationId || "an_error_occured")];

        if (err.status) {
            output.push("[" + err.status + "]");
        }

        if (err.data || err.statusText) {
            output.push((err.data && err.data.message) || err.statusText);
        }

        if (typeof err === "string") {
            output.push($translate.instant(err));
        }

        Toast.error(
            output.join(" ")
        );
        return $q.reject(err);
    };
});
