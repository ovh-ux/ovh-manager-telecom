angular.module("managerApp").filter("replace", function () {
    "use strict";

    return function (str, from, to) {
        return ("" + str).replace(from, to);
    };
});

