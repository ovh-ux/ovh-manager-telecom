angular.module("managerApp").service("TelecomTelephonyLineCallsForwardService", function ($q, OvhApiTelephony, $translate, TelecomTelephonyLineCallsForwardPhoneNumber, TelecomTelephonyLineCallsForward, TelecomTelephonyLineCallsForwardNature) {
    "use strict";

    /**
     * @param  {String} billingAccount Billing account
     * @param  {String} serviceName    Service name
     * @param  {Object} forwards       Data to save
     * @return {Promise}
     */
    this.saveForwards = function (billingAccount, serviceName, forwards) {
        var dataToSave = {};
        _.forEach(forwards, function (elt) {
            _.extend(dataToSave, elt.saveData);
        });
        return OvhApiTelephony.Line().Options().Lexi().update(
            {
                billingAccount: billingAccount,
                serviceName: serviceName
            },
            dataToSave
        ).$promise;
    };

    /**
     * Load all the natures of number
     * @return {Promise}
     */
    this.loadNatures = function () {
        return OvhApiTelephony.Lexi().schema().$promise.then(
            function (schema) {
                if (schema.models && schema.models["telephony.LineOptionForwardNatureTypeEnum"] && schema.models["telephony.LineOptionForwardNatureTypeEnum"].enum) {
                    return _.map(
                        schema.models["telephony.LineOptionForwardNatureTypeEnum"].enum,
                        function (elt) {
                            return new TelecomTelephonyLineCallsForwardNature(elt);
                        }
                    ).concat(new TelecomTelephonyLineCallsForwardNature("external"));
                }
                return $q.reject();

            }
        );
    };

    /**
     * Load all numbers from all billing accounts
     * @return {Promise}
     */
    this.loadAllOvhNumbers = function (excludeLine) {
        return OvhApiTelephony.Number().Aapi().all().$promise.then(function (ovhNums) {
            if (excludeLine) {
                _.remove(
                    ovhNums,
                    { type: "line", serviceName: excludeLine }
                );
            }
            var allNumbers = _.map(
                ovhNums,
                function (num) {
                    return new TelecomTelephonyLineCallsForwardPhoneNumber(_.pick(num, ["billingAccount", "description", "serviceName", "type"]));
                }
            );
            var filteredNumber = _.filter(allNumbers, function (num) {
                return ["fax", "voicemail", "line", "number"].indexOf(num.type) > -1;
            });
            var sortedNumber = _.sortByOrder(filteredNumber, ["description", "serviceName"], ["desc", "asc"]);
            return sortedNumber;
        });
    };

    /**
     * Load all forwards for a given service name
     * @param  {String} billingAccount                  Billing account
     * @param  {String} serviceName                     Service name
     * @param   {Array} lineOptionForwardNatureTypeEnum All the natures of number
     * @param   {Array} allOvhNumbers                   All numbers from all billing accounts
     * @return {Promise}
     */
    this.loadForwards = function (billingAccount, serviceName, lineOptionForwardNatureTypeEnum, allOvhNumbers) {
        return OvhApiTelephony.Line().Options().Lexi().get({
            billingAccount: billingAccount,
            serviceName: serviceName
        }).$promise.then(
            function (options) {
                _.forEach(
                    options,
                    function (data, key) {
                        if (/^forward\w*Nature$/.test(key)) {
                            options[key] = _.isString(data) ? _.find(lineOptionForwardNatureTypeEnum, { value: data }) : data;
                        }
                        if (/^forward\w*Number$/.test(key)) {
                            options[key] = _.find(allOvhNumbers, { serviceName: data });

                            // Not OVH number
                            if (!options[key]) {
                                var matcher = key.match(/^forward(\w*)Number$/);
                                var natureKey = ["forward", matcher[1], "Nature"].join("");
                                options[key] = new TelecomTelephonyLineCallsForwardPhoneNumber({
                                    serviceName: data,
                                    type: "external"
                                });
                                options[natureKey] = _.find(lineOptionForwardNatureTypeEnum, { value: "external" });
                            }
                        }
                    }
                );
                return _.map(
                    ["Unconditional", "NoReply", "Busy", "Backup"],
                    function (elt) {
                        return new TelecomTelephonyLineCallsForward(options, elt);
                    }
                );
            }
        );
    };

});
