angular.module("managerApp").filter("duration", function (moment, $filter) {
    "use strict";

    return function (seconds) {
        if (_.isFinite(seconds)) {
            return $filter("date")(moment.unix(seconds).toDate(), "HH:mm:ss", "UTC");
        }
        return "-";

    };
});

