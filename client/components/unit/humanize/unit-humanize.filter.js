angular.module("managerApp").filter("unit-humanize", function ($translate) {
    return function (bytes, type, precision) {
        var precisionVal = precision;
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
            return "-";
        }
        if (_.isUndefined(precision)) {
            precisionVal = 1;
        }
        var units = {
            bit: [
                "unit_bits_per_sec",
                "unit_kilo_bits_per_sec",
                "unit_mega_bits_per_sec",
                "unit_giga_bits_per_sec",
                "unit_tera_bits_per_sec",
                "unit_peta_bits_per_sec"
            ],
            generic: [
                "unit_generic_per_sec",
                "unit_kilo_generic_per_sec",
                "unit_mega_generic_per_sec",
                "unit_giga_generic_per_sec",
                "unit_tera_generic_per_sec",
                "unit_peta_generic_per_sec"
            ]
        };
        var number = Math.floor(Math.log(bytes) / Math.log(1024));
        var value = (bytes / Math.pow(1024, Math.floor(number))).toFixed(precisionVal); // eslint-disable-line no-restricted-properties
        return $translate.instant(units[type || "generic"][number], { val: value });
    };
});
