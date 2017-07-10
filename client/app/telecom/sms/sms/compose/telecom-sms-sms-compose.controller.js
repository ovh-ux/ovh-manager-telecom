angular.module("managerApp").controller("TelecomSmsSmsComposeCtrl", function ($q, $translate, $stateParams, $filter, $uibModal, Sms, SmsMediator, User,
                                                                              atInternet, Toast, ToastError, URLS) {
    "use strict";

    var self = this;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function fetchEnums () {
        return SmsMediator.getApiScheme().then(function (schema) {
            return {
                smsClass: _.pull(schema.models["sms.ClassEnum"].enum, "toolkit")
            };
        });
    }

    function fetchUser () {
        return User.Lexi().get().$promise;
    }

    function fetchSenders () {
        return Sms.Senders().Lexi().query({
            serviceName: $stateParams.serviceName
        }).$promise.then(function (sendersIds) {
            return $q.all(_.map(sendersIds, function (sender) {
                return Sms.Senders().Lexi().get({
                    serviceName: $stateParams.serviceName,
                    sender: sender
                }).$promise;
            })).then(function (senders) {
                return _.filter(senders, { status: "enable" });
            });
        });
    }

    function fetchReceivers () {
        return Sms.Receivers().Lexi().query({
            serviceName: $stateParams.serviceName
        }).$promise.then(function (receiversIds) {
            return $q.all(_.map(receiversIds, function (id) {
                return Sms.Receivers().Lexi().get({
                    serviceName: $stateParams.serviceName,
                    slotId: id
                }).$promise;
            }));
        });
    }

    function fetchPhonebooks () {
        return Sms.Phonebooks().Lexi().query({
            serviceName: $stateParams.serviceName
        }).$promise.then(function (phonebooksIds) {
            return $q.all(_.map(phonebooksIds, function (bookKey) {
                return Sms.Phonebooks().Lexi().get({
                    serviceName: $stateParams.serviceName,
                    bookKey: bookKey
                }).$promise;
            })).then(function (phonebooks) {
                return _.sortBy(phonebooks, "name");
            });
        });
    }

    function getDifferedPeriod () {
        var date = new Date();

        if (self.picker.date) {
            self.picker.date.setHours(self.picker.time.getHours());
            self.picker.date.setMinutes(self.picker.time.getMinutes());

            if (self.picker.date > date) {
                var minutes = moment(self.picker.date).diff(moment(), "minutes");
                return minutes;
            }
        }

        return null;
    }

    function createSms (slotId) {
        var phonebookContactNumber = [];
        _.each(self.phonebooks.lists, function (contact) {
            phonebookContactNumber.push(_.get(contact, contact.type));
        });
        var receivers = _.union(phonebookContactNumber, self.sms.receivers ? [self.sms.receivers] : null);
        var differedPeriod = self.sms.differedPeriod ? getDifferedPeriod() : null;
        var sender = self.sms.sender === "shortNumber" ? null : self.sms.sender;
        var senderForResponse = self.sms.sender === "shortNumber" ? true : self.sms.senderForResponse;

        return {
            charset: "UTF-8",
            "class": self.sms.class,
            coding: self.message.coding,
            differedPeriod: differedPeriod,
            message: self.sms.message,
            noStopClause: !!self.sms.noStopClause,
            priority: "high",
            receivers: receivers,
            receiversSlotId: slotId || null,
            sender: sender,
            senderForResponse: senderForResponse,
            validityPeriod: "2880"
        };
    }

    function resetForm (form) {
        // restore default values
        self.sms = {
            "class": "phoneDisplay",
            differedPeriod: false,
            message: null,
            receivers: null,
            noStopClause: false,
            sender: "shortNumber",
            senderForResponse: false
        };

        self.computeRemainingChar();
        self.clearReceiversLists();
        self.clearPhonebookContactList();

        // hide the options panel
        self.moreOptions = false;

        form.$setPristine(true);
    }

    self.isVirtualNumber = function () {
        return !!_.find(self.senders.virtual, { sender: self.sms.sender });
    };

    self.getEstimationCreditRemaining = function () {
        var totalReceivers = self.receivers.records + self.phonebooks.lists.length + (self.sms.receivers ? 1 : 0);
        var creditRemaining = self.service.creditsLeft - (totalReceivers * self.message.equivalence);
        return $filter("number")(creditRemaining, 2);
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    /* ----------  RECEIVERS  ----------*/

    self.clearReceiversLists = function ($event) {
        if ($event) {
            $event.preventDefault();
        }

        self.receivers.records = self.receivers.count = 0;
        return _.map(self.receivers.raw, function (receiver) {
            receiver.isSelected = false;
        });
    };

    self.addReceiversLists = function ($event) {
        $event.preventDefault();

        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/sms/compose/addReceiversLists/telecom-sms-sms-compose-addReceiversLists.html",
            controller: "TelecomSmsSmsComposeAddReceiversListsCtrl",
            controllerAs: "AddReceiversListsCtrl",
            resolve: {
                receivers: function () { return self.receivers.raw; }
            }
        });

        modal.result.then(function (receivers) {
            self.receivers = {
                raw: receivers,
                count: _.size(_.filter(receivers, "isSelected")),
                records: _.sum(_.pluck(_.filter(receivers, "isSelected"), "records"))
            };
        });

        return modal;
    };

    /* ----------  PHONEBOOK CONTACT  ----------*/

    self.addPhonebookContact = function ($event) {
        $event.preventDefault();
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/sms/compose/addPhonebookContact/telecom-sms-sms-compose-addPhonebookContact.html",
            controller: "TelecomSmsSmsComposeAddPhonebookContactCtrl",
            controllerAs: "AddPhonebookContactCtrl",
            resolve: {
                phonebooks: function () { return self.phonebooks; }
            }
        });

        modal.result.then(function (result) {
            self.phonebooks.lists = [];
            _.each(result, function (contact) {
                self.phonebooks.lists.push(contact);
            });
        });

        return modal;
    };

    self.clearPhonebookContactList = function ($event) {
        if ($event) {
            $event.preventDefault();
        }
        self.phonebooks.lists = [];
        return self.phonebooks;
    };

    /* ----------  Send  ----------*/

    self.send = function (form) {
        var promises = [];
        var slotIds = _.pluck(_.filter(self.receivers.raw, "isSelected"), "slotId");

        self.loading.send = true;
        if (self.isVirtualNumber()) {
            if (self.sms.receivers || _.size(self.phonebooks.lists)) {
                promises.push(Sms.VirtualNumbers().Jobs().Lexi().send({
                    serviceName: $stateParams.serviceName,
                    number: self.sms.sender
                }, _.omit(createSms(), [
                    "sender",
                    "noStopClause",
                    "senderForResponse"
                ])).$promise);
            }
            if (_.size(slotIds)) {
                _.map(slotIds, function (slotId) {
                    promises.push(Sms.VirtualNumbers().Jobs().Lexi().send({
                        serviceName: $stateParams.serviceName,
                        number: self.sms.sender
                    }, _.omit(createSms(slotId), [
                        "receivers",
                        "sender",
                        "noStopClause",
                        "senderForResponse"
                    ])).$promise);
                });
            }
        } else {
            if (self.sms.receivers || _.size(self.phonebooks.lists)) {
                promises.push(Sms.Jobs().Lexi().send({
                    serviceName: $stateParams.serviceName
                }, createSms()).$promise);
            }
            if (_.size(slotIds)) {
                _.map(slotIds, function (slotId) {
                    promises.push(Sms.Jobs().Lexi().send({
                        serviceName: $stateParams.serviceName
                    }, _.omit(createSms(slotId), "receivers")).$promise);
                });
            }
        }

        return $q.all(promises).then(function (results) {
            var totalCreditsRemoved = _.sum(results, "totalCreditsRemoved");
            var invalidReceivers = _.chain(results).pluck("invalidReceivers").flatten().value();
            var validReceivers = _.chain(results).pluck("validReceivers").flatten().value();

            // update the creditLeft value (displayed on the dashboard)
            self.service.creditsLeft -= totalCreditsRemoved;

            atInternet.trackClick({
                name: "sms-sended",
                type: "action",
                chapter1: "telecom-sms",
                chapter2: "telecom-sms-sms",
                chapter3: "telecom-sms-sms-compose",
                customObject: {
                    nichandle: _.get(self.user, "nichandle"),
                    country: _.get(self.user, "country"),
                    receiversCount: self.receivers.count,
                    receiversLists: self.receivers.records + (self.sms.receivers ? 1 : 0),
                    phonebookContactCount: self.phonebooks.lists.length,
                    totalCreditsRemoved: totalCreditsRemoved,
                    invalidReceivers: _.size(invalidReceivers),
                    validReceivers: _.size(validReceivers)
                }
            });


            resetForm(form);

            Toast.success($translate.instant("sms_sms_compose_status_success"));
        }).catch(function (err) {
            Toast.error($translate.instant("sms_sms_compose_status_failed"));
            return $q.reject(err);
        }).finally(function () {
            self.loading.send = false;
        });
    };

    self.cancel = function (form) {
        resetForm(form);
    };

    /* ----------  Aside tips  ----------*/

    self.tips = function ($event, tip) {
        $event.preventDefault();
        $event.stopPropagation();

        var modal = $uibModal.open({
            templateUrl: "app/telecom/sms/sms/compose/tips/telecom-sms-sms-compose-tips-" + tip + ".html",
            controller: "TelecomSmsSmsComposeTipsCtrl",
            controllerAs: "ComposeTipsCtrl"
        });

        return modal;
    };

    /* -----  End of ACTIONS  ------*/

    /*= ==============================
    =            EVENTS            =
    ===============================*/

    self.showAdvice = function () {
        if (self.sms.sender && /[0-9\+]/.test(self.sms.sender) && !self.isVirtualNumber()) {
            self.advice = true;
            self.sms.noStopClause = true;
        } else {
            self.advice = false;
            self.sms.noStopClause = false;
        }
        return self.computeRemainingChar();
    };

    self.computeRemainingChar = function () {
        return _.assign(self.message, SmsMediator.getSmsInfoText(
            self.sms.message,
            !self.sms.noStopClause // suffix
        ));
    };

    self.openDatePicker = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();

        self.picker.dateOpened = true;
    };

    /* -----  End of EVENTS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading = {
            init: false,
            send: false
        };

        self.enums = {};

        self.user = {};

        self.senders = {
            raw: [],
            alphanumeric: [],
            other: [],
            virtual: []
        };

        self.receivers = {
            raw: [],
            count: 0,
            records: 0
        };

        self.phonebooks = {
            raw: [],
            current: null,
            lists: []
        };

        self.service = null;

        self.message = {
            coding: "7bit",
            defaultSize: 160,
            remainingCharacters: null,
            equivalence: null, // number of SMS that will be sent
            maxlength: null,
            maxLengthReached: false
        };

        self.sms = {
            "class": "phoneDisplay",
            differedPeriod: false,
            message: null,
            noStopClause: false,
            receivers: null,
            sender: "shortNumber",
            senderForResponse: false
        };

        self.advice = false;

        self.moreOptions = false;

        self.picker = {
            date: null,
            dateOpened: false,
            time: moment().toDate(),
            options: {
                minDate: moment().toDate()
            }
        };

        self.urls = {
            receivers: _.get(URLS, "guides.sms.receivers")
        };

        self.loading.init = true;
        return SmsMediator.initDeferred.promise.then(function () {
            return $q.all({
                enums: fetchEnums(),
                user: fetchUser(),
                senders: fetchSenders(),
                receivers: fetchReceivers(),
                phonebooks: fetchPhonebooks()
            }).then(function (result) {
                self.enums = result.enums;
                self.user = result.user;
                self.senders.raw = result.senders;
                self.receivers.raw = result.receivers;
                self.phonebooks.raw = result.phonebooks;
                self.phonebooks.current = _.head(self.phonebooks.raw);
                return self.senders.raw;
            }).then(function (senders) {
                return _.each(senders, function (sender) {
                    if (sender.type === "virtual") {
                        self.senders.virtual.push(sender);
                    } else if (/\d+/.test(sender.sender)) {
                        self.senders.other.push(sender);
                    } else {
                        self.senders.alphanumeric.push(sender);
                    }
                });
            }).then(function () {
                self.service = SmsMediator.getCurrentSmsService();
                self.computeRemainingChar();
            });
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
