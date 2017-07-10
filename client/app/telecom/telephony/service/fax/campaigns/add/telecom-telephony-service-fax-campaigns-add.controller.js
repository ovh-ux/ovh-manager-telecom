angular.module("managerApp").controller("TelecomTelephonyServiceFaxCampaignsAddCtrl", function ($q, $stateParams, $translate, $timeout, $uibModalInstance, Telephony, User, ToastError) {
    "use strict";

    var self = this;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function fetchEnums () {
        return Telephony.Lexi().schema({
            billingAccount: $stateParams.billingAccount
        }).$promise.then(function (schema) {
            return {
                quality: schema.models["telephony.FaxQualityEnum"].enum,
                sendType: schema.models["telephony.FaxCampaignSendTypeEnum"].enum,
                recipientsType: schema.models["telephony.FaxCampaignRecipientsTypeEnum"].enum
            };
        });
    }

    function setCampainDateTime () {
        if (self.campaign.sendDate) {
            self.campaign.sendDate.setHours(self.picker.time.getHours());
            self.campaign.sendDate.setMinutes(self.picker.time.getMinutes());
        }
        return self.campaign.sendDate;
    }

    function createCampaign (doc) {
        return Telephony.Fax().Campaigns().Lexi().create({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, {
            recipientsType: self.campaign.recipientsType,
            documentId: doc.id,
            name: self.campaign.name,

            // faxQuality: self.campaign.quality,      @missing-api
            sendType: self.campaign.sendType,
            sendDate: setCampainDateTime(),
            recipientsList: _.words(self.campaign.recipientsList),
            recipientsDocId: self.campaign.recipientsDocId
        }).$promise.catch(function (error) {
            return self.cancel({
                type: "API",
                message: _.get(error, "data.message")
            });
        });
    }

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.openDatePicker = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        self.picker.dateOpened = true;
    };

    self.checkValidPdfExtention = function (file) {
        var fileName = file ? file.name : "";
        var found = _.endsWith(fileName.toLowerCase(), "pdf");
        if (!found) {
            ToastError($translate.instant("telephony_fax_campaigns_add_campaign_file_invalid"));
        }
        return found;
    };

    self.add = function () {
        self.loading.add = true;
        return User.Document().Lexi().upload(
            self.campaign.uploadedFile.name,
            self.campaign.uploadedFile
        ).then(function (doc) {
            return $q.all({
                create: createCampaign(doc),
                noop: $timeout(angular.noop, 1000)
            }).then(function () {
                self.loading.add = false;
                self.added = true;
                return $timeout(self.close, 1500);
            });
        })
            .catch(function (error) {
                return self.cancel({
                    type: "API",
                    message: _.get(error, "data.message")
                });
            });
    };

    self.cancel = function (message) {
        return $uibModalInstance.dismiss(message);
    };

    self.close = function () {
        return $uibModalInstance.close(true);
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading = {
            init: false,
            add: false
        };

        self.enums = {};

        self.campaign = {};

        self.picker = {
            dateOpened: false,
            time: new Date(),
            options: {
                minDate: new Date()
            }
        };

        self.pattern = {
            recipientsList: /^\+?\d{6,17}([,;\s]\+?\d{6,17})*$/,
            recipientsDocId: /^(https?):\/\/.*$/
        };

        self.loading.init = true;
        return fetchEnums().then(function (enums) {
            self.enums = enums;

            self.campaign.quality = "normal";
            self.campaign.sendType = _.last(_.pull(self.enums.sendType, "automatic")); // scheduled
            self.campaign.recipientsType = "list";

            // set a multiline placeholder attribut
            self.recipientsListPlaceholder = [
                $translate.instant("telephony_service_fax_campaigns_add_campaign_palceholder_recipients_list_first"),
                $translate.instant("telephony_service_fax_campaigns_add_campaign_palceholder_recipients_list_second")
            ].join("\n");
        }).catch(function (err) {
            self.campaign = {};
            return new ToastError(err);
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
