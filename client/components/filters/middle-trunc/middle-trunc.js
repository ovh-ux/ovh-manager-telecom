angular.module("managerApp").filter("middleTrunc", function () {
    "use strict";
    return function (str, len) {
        if ((len > 4) && (len < str.length)) {
            var begin = str.substring(0, (len - 3) / 2);
            var end = str.substr(-(len - 3) / 2);
            return begin + "..." + end;
        }
        return str;
    };
});
