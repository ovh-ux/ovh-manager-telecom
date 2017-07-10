angular.module("managerApp").filter("snakeCase", function () {
    "use strict";

    return function (text) {
        return _.snakeCase(text);
    };
});
