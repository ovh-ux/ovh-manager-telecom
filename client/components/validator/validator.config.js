angular.module("managerApp").run(function (punycode) {
    "use strict";

    var Rio = function (rioStr) {
        if (!/[A-Z0-9\+]{12}/i.test(rioStr)) {
            return;
        }
        var rioUp = rioStr.toUpperCase();
        this.isMobile = /^d{2}$/.test(rioUp.substr(0, 2)); // mobile RIO : only figures
        this.isFix = /^[F-Z][0-9A-Z]/.test(rioUp.substr(0, 2)); // fix RIO
        this.provider = rioUp.substr(0, 2);
        this.contractType = rioUp.substr(2, 1);
        this.customer = rioUp.substr(3, 6);
        this.control = rioUp.substr(9, 3);
        this.rio = rioUp;
    };

    function checkRioSum (str, control) {
        var order = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+";
        var a = 0;
        var b = 0;
        var c = 0;
        for (var i = 0; i < 19; i++) {
            var position = order.indexOf(str[i]);
            a = ((1 * a) + position) % 37;
            b = ((2 * b) + position) % 37;
            c = ((4 * c) + position) % 37;
        }
        return (order[a] + order[b] + order[c]) === control;
    }

    Rio.prototype.check = function (phoneNumber) {
        var tel = (phoneNumber || "").replace(/[^0-9]/g, "");
        var rioValid = checkRioSum(this.provider + this.contractType + this.customer + tel, this.control);
        var rioCompliant = (/^0[6-7]/.test(tel) && this.isMobile) || (/^0[1-5]/.test(tel) && this.isFix);
        return !!this.rio && rioValid && rioCompliant;
    };

    /**
     * Validate a RIO
     * @param {String} rio          RIO code
     * @param {String} phoneNumber  Corresponding phone number
     */
    validator.extend("isRio", function (rio, phoneNumber) {
        return (new Rio(rio)).check(phoneNumber);
    });

    /**
     * Validate a Standard insee
     * @param {Object} obj          Object containing in
     */
    validator.extend("hasInseeCode", function (obj) {
        return _.isObject(obj) && !!obj.inseeCode;
    });

    /**
     * Validate a zipcode
     * @param {String} zipcode Zip code to validate
     * @param  {Array} filter  scope of the zip code
     */
    validator.extend("isZipcode", function (zipcode, filter) {
        var check = {
            frenchOverseas: /^9[78]\d{3}$/.test(zipcode),
            metropolitanFrance: /^\d{5}$/.test(zipcode) && (zipcode >= 1000) && (zipcode < 96000),
            fr: (/^\d{5}$/.test(zipcode) && (zipcode >= 1000) && (zipcode < 96000)) || /^9[78]\d{3}$/.test(zipcode),
            be: /^\d{4}$/.test(zipcode) && (zipcode >= 1000),
            de: /^\d{5}$/.test(zipcode) && (zipcode >= 10000),
            ch: /^\d{4}$/.test(zipcode) && (zipcode >= 1000) && (zipcode < 9499),
            es: /^\d{5}$/.test(zipcode) && (((zipcode >= 1000) && (zipcode < 53000)) || /^070/.test(zipcode) || /^071/.test(zipcode) || /^080/.test(zipcode)),
            gb: true // No real validation rules ! there are cases for London (new rule), London (old rule), Eire, the rest of the country
        };
        var theFilter = filter || Object.keys(check);
        return theFilter.reduce(function (all, thisTest) {
            return all || check[thisTest];
        }, false);
    });

    /**
     *  Validate an IPv4Block or IPv6Block
     *  @param {String} str     IP representation string
     *  @param {Number} version IP version
     */
    validator.extend("isIPBlock", function (str, version) {
        if (version === 4 || version === 6) {
            var split = str.split("/");
            return split.length === 2 && validator.isIP(split[0], version) &&
                parseInt(split[1], 10) > 0 && parseInt(split[1], 10) <= (version === 4 ? 32 : 128);
        }
        return validator.isIPBlock(str, 4) || validator.isIPBlock(str, 6);
    });

    /**
     *  Validate a private IP range (according to RFC 1918)
     *  @param {String} str     IP representation string
     *  @return {Boolean}
     */
    validator.extend("isPrivateIPv4", function (str) {
        if (validator.isIP(str, 4)) {
            var ipBlock = str.split(".");
            var bitBlock = parseInt(ipBlock[0], 10);
            var secondBitBlock = parseInt(ipBlock[1], 10);
            switch (bitBlock) {
            case 192: // 16-bit block
                return secondBitBlock === 168;
            case 172: // 20-bit block
                return secondBitBlock >= 16 && secondBitBlock <= 31;
            default: // 24-bit block
                return parseInt(bitBlock, 10) === 10;
            }
        }

        return false;
    });

    /**
     *  Validate a siret code
     *  @param {String} siret SIRET code
     */
    validator.extend("isSiret", function (siret) {
        if (_.isEmpty(siret)) {
            return true;
        }
        var theSiret = "" + (/^\d{14}$/.test(siret) ? siret : "00000000000001");
        var luhn = theSiret.split("").reverse().map(
            function (val, index) {
                return index % 2 ? val * 2 : parseInt(val, 10);
            }
        );
        var luhnSum = luhn.reduce(
            function (total, elt) {
                return total + (elt < 10 ? elt : elt - 9);
            },
            0
        );
        return luhnSum % 10 === 0;
    });

    validator.extend("isFrenchLandLine", function (phone) {
        return /^0[1-5]([\\s\\-]?([0-9]){2}){4}$/.test(phone);
    });

    validator.extend("isFrenchPhoneNumber", function (phone) {
        return /^(0033|\+33\s?(\(0\))?|0)[^08](\s*\d{2}){4}$/.test(phone);
    });

    validator.extend("isMacAddress", function (val) {
        var values = val.split(/:/);
        return values.length === 6 && _.reduce(values, function (result, elt) {
            return /^[0-9a-f]{2}$/i.test(elt) && result;
        }, true);
    });

    /**
     * Check if a domain is valid
     * @param {String}  domain                          - The domain to check validity
     * @param {Object}  options                         - Options for validation check
     * @param {Boolean} options.canBeginWithUnderscore  - specifics NDD can be like: _foo._bar.example.com
     * @param {Boolean} options.canBeginWithWildcard    - specifics NDD can be like: *.foo.bar.example.com
     * @return {Boolean}
     */
    validator.extend("isValidDomain", function (domain, options) {
        var theOptions = options || {};
        var inError = false;

        if (domain) {
            var punycodeVersion = punycode.toASCII(domain.trim());
            var dotSplit = punycodeVersion.split(".");

            // Check lengths
            inError = punycodeVersion.length > 255 || dotSplit.length < 2;

            // Check wildcard
            if (!inError && punycodeVersion.indexOf("*") !== -1 &&
                (theOptions.canBeginWithWildcard ? !/^(?:\*\.)[^\*]+$/.test(punycodeVersion) : true)) {
                inError = true;
            }

            // Check subdomain(s)
            if (!inError) {
                angular.forEach(dotSplit, function (sub) {
                    if (sub.length > 63 ||
                        /(?:(?:^\s*$)|(?:^-)|(?:-$))/.test(sub)) {
                        inError = true;
                    }
                    if (sub.indexOf("_") !== -1 &&
                        (theOptions.canBeginWithUnderscore ? !/^_[^_]+$/.test(sub) : true)) {
                        inError = true;
                    }
                });
            }

            // Check if it's not an IP
            if (!inError && validator.isIP(domain)) {
                inError = true;
            }

            // Check chars globally
            if (!inError) {
                inError = !/^[\w\-\.\*]+$/.test(punycodeVersion);
            }

        }
        return !inError;
    });

});
