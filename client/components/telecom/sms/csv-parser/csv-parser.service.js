angular.module("managerApp").service("CSVParser", function () {
    "use strict";

    this.setColumnSeparator = function (separatorParam) {
        var separator = separatorParam;

        if (separator === undefined) {
            separator = ";";
        }

        CSV.COLUMN_SEPARATOR = separator;
    };

    this.setDetectTypes = function (detectParam) {
        var detect = detectParam;

        if (detect === undefined) {
            detect = false;
        }

        CSV.DETECT_TYPES = detect;
    };

    this.parse = function (data) {
        return CSV.parse(data);
    };
});
