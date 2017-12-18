angular.module("managerApp").controller("TelecomTelephonyLineCallsForwardCtrl", function ($q, $stateParams, $translate, $state, Toast, TelecomTelephonyLineCallsForwardService, validator, telephonyBulk) {
    "use strict";

    var self = this;
    this.validator = validator;

    /**
         * Save the current forwards
         * @return {Promise}
         */
    this.save = function () {
        self.loading.save = true;
        return TelecomTelephonyLineCallsForwardService.saveForwards($stateParams.billingAccount, $stateParams.serviceName, self.forwards).finally(function () {
            self.loading.save = false;
        }).then(
            function () {
                Toast.success($translate.instant("telephony_line_actions_line_calls_forward_save_success"));
                self.saved = angular.copy(self.forwards);
            },
            function (err) {
                Toast.error($translate.instant("telephony_line_actions_line_calls_forward_save_error"));
                return $q.reject(err);
            }
        ).finally(function () {
            self.loading.save = false;
        });
    };

    /**
         * Check if it could be a phone number
         * @param  {[type]} num [description]
         * @return {[type]}     [description]
         */
    this.seemsPhoneNumber = function (num, forward) {
        if (forward.enable) {
            return /^00[\d\s]*$|^\+\d[\d\s]*$/.test(num);
        }
        return true;

    };

    /**
         * Cancel modifications
         */
    this.cancel = function () {
        this.setCancelBuffer(true);
    };

    this.toggleChecked = function (forward) {
        _.forEach(this.forwards, function (fwd) {
            if (forward.type === "Unconditional") {
                if (fwd.type !== forward.type) {
                    fwd.enable = false;
                }
            } else if (fwd.type === "Unconditional") {
                fwd.enable = false;
            }
            return false;
        });
    };

    /**
         * Do we need to save ?
         * @return {Bool}
         */
    this.needSave = function () {
        var toSave = false;
        _.forEach(this.forwards, function (forward) {
            var saved = _.find(self.saved, { type: forward.type });
            if (!saved || saved.footPrint !== forward.footPrint) {
                toSave = true;
            }
        });
        return toSave;
    };

    /**
         * Reset the number on nature change (fax -> voicemail, for instance)
         * @param {Object} forward Forward description
         */
    this.resetNumber = function (forward) {
        forward.number = null;
    };

    /**
         * Filter the phone numbers
         * @param  {String} search string to search
         * @param  {Array} origin fax, line voicemail
         * @return {Array}
         */
    this.getFilteredNumbers = function (search, origin) {
        var searchReg = new RegExp(search, "i");
        return _.filter(this.allOvhNumbers, function (num) {
            return (searchReg.test(num.serviceName) || searchReg.test(num.description)) && (!origin || origin.indexOf(num.type) > -1);
        });
    };

    /**
         * Make a save of the current data
         */
    this.setCancelBuffer = function (restore) {
        if (restore) {
            this.forwards = angular.copy(this.saved);
            _.forEach(this.forwards, function (forward) {
                forward.nature = _.find(self.lineOptionForwardNatureTypeEnum, { value: forward.nature.value });
                forward.number = _.find(self.allOvhNumbers, { type: forward.number.type, serviceName: forward.number.serviceName });
            });
        } else {
            this.saved = angular.copy(this.forwards);
        }
        this.masterForward = _.find(this.forwards, { master: true });
    };

    /**
         * get the cancellation of the data
         * @return {Object} saved data
         */
    this.getCancelBuffer = function () {
        return this.saved;
    };

    /* ===========================
    =            BULK            =
    ============================ */

    self.bulkDatas = {
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
        infos: {
            name: "forward",
            actions: [{
                name: "options",
                route: "/telephony/{billingAccount}/line/{serviceName}/options",
                method: "PUT",
                params: null
            }]
        }
    };

    self.filterServices = function (services) {
        return _.filter(services, function (service) {
            return ["sip", "mgcp"].indexOf(service.featureType) > -1;
        });
    };

    self.getBulkParams = function () {
        var data = {};
        var forwardBackup = _.find(self.forwards, "type", "Backup");
        var forwardBusy = _.find(self.forwards, "type", "Busy");
        var forwardNoReply = _.find(self.forwards, "type", "NoReply");
        var forwardUnconditional = _.find(self.forwards, "type", "Unconditional");

        if (forwardBackup) {
            data.forwardBackup = forwardBackup.enable;
            data.forwardBackupNature = extractNatureFromForward(forwardBackup);
            data.forwardBackupNumber = extractNumberFromForward(forwardBackup);
        }

        if (forwardBusy) {
            data.forwardBusy = forwardBusy.enable;
            data.forwardBusyNature = extractNatureFromForward(forwardBusy);
            data.forwardBusyNumber = extractNumberFromForward(forwardBusy);
        }

        if (forwardNoReply) {
            data.forwardNoReplyDelay = forwardNoReply.delay;
            data.forwardNoReply = forwardNoReply.enable;
            data.forwardNoReplyNature = extractNatureFromForward(forwardNoReply);
            data.forwardNoReplyNumber = extractNumberFromForward(forwardNoReply);
        }

        if (forwardUnconditional) {
            data.forwardUnconditional = forwardUnconditional.enable;
            data.forwardUnconditionalNature = extractNatureFromForward(forwardUnconditional);
            data.forwardUnconditionalNumber = extractNumberFromForward(forwardUnconditional);
        }

        return data;
    };

    self.onBulkSuccess = function (bulkResult) {
        // display message of success or error
        telephonyBulk.getToastInfos(bulkResult, {
            fullSuccess: $translate.instant("telephony_line_actions_line_calls_forward_bulk_all_success"),
            partialSuccess: $translate.instant("telephony_line_actions_line_calls_forward_bulk_some_success", {
                count: bulkResult.success.length
            }),
            error: $translate.instant("telephony_line_actions_line_calls_forward_bulk_error")
        }).forEach(function (toastInfo) {
            Toast[toastInfo.type](toastInfo.message, {
                hideAfter: null
            });
        });

        // reset initial values to be able to modify again the options
        TelecomTelephonyLineCallsForwardService.resetAllCache();
        init();
    };

    self.onBulkError = function (error) {
        Toast.error([$translate.instant("telephony_line_actions_line_calls_forward_bulk_on_error"), _.get(error, "msg.data")].join(" "));
    };

    /* -----  End of BULK  ------ */

    /**
         * Load all fowards
         * @return {Promise}
         */
    function loadForwards () {
        return TelecomTelephonyLineCallsForwardService.loadForwards(
            $stateParams.billingAccount,
            $stateParams.serviceName,
            self.lineOptionForwardNatureTypeEnum,
            self.allOvhNumbers
        ).then(
            function (forwards) {
                self.forwards = forwards;
                self.setCancelBuffer();
            },
            function (err) {
                Toast.error($translate.instant("telephony_line_actions_line_calls_forward_options_load_error"));
                return $q.reject(err);
            }
        );
    }

    /**
         * Load all numbers of all billing accounts
         * @return {Promise}
         */
    function loadAllOvhNumbers () {
        return TelecomTelephonyLineCallsForwardService.loadAllOvhNumbers($stateParams.serviceName).then(
            function (allOvhNumbers) {
                self.allOvhNumbers = allOvhNumbers;
                return allOvhNumbers;
            },
            function (err) {
                Toast.error($translate.instant("telephony_line_actions_line_calls_forward_number_load_error"));
                $q.reject(err);
            }
        );
    }

    /**
         * Load all possible forward natures
         * @return {Promise}
         */
    function loadNatures () {
        return TelecomTelephonyLineCallsForwardService.loadNatures().then(
            function (natures) {
                self.lineOptionForwardNatureTypeEnum = natures;
            }, function () {
            Toast.error($translate.instant("telephony_line_actions_line_calls_forward_schema_load_error"));
            return $q.reject();
        }
        );
    }

    function extractNatureFromForward (forward) {
        var nature;
        nature = _.get(forward.nature, "value", null);

        return nature === "external" ? "number" : nature;
    }

    function extractNumberFromForward (forward) {
        var number;
        number = _.get(forward.nature, "value", null) === "external" ? _.get(forward.externalNumber, "serviceName", null) : _.get(forward.number, "serviceName", null);

        return number || _.get(forward.number, "serviceName", null);
    }

    function init () {
        self.loading = {
            init: true
        };
        self.options = {
            lockOutCallPassword: null,
            lockOutCall: null
        };
        self.saved = angular.copy(self.options);
        loadAllOvhNumbers().then(loadNatures).then(loadForwards).finally(function () {
            self.loading.init = false;
        });
    }

    init();
});
