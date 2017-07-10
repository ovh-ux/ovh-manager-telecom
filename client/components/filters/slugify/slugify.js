angular.module("managerApp").filter("slugify", function () {
    "use strict";
    return function (str) {
        return _.snakeCase(str);
    };
});
