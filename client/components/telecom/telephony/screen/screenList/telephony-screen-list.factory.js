/**
 *  @todo : manage sip feature type => /screen API
 */
angular.module("managerApp").factory("VoipScreenScreenList", function (OvhApiTelephony) {
    "use strict";

    /*= ==================================
    =            CONSTRUCTOR            =
    ===================================*/

    function VoipScreenScreenList (screenListOptionsParam) {
        var screenListOptions = screenListOptionsParam || {};

        // options check
        if (!screenListOptions.billingAccount) {
            throw new Error("billingAccount option must be specified when creating a new VoipScreenScreenList");
        }
        if (!screenListOptions.serviceName) {
            throw new Error("serviceName option must be specified when creating a new VoipScreenScreenList");
        }
        if (!screenListOptions.featureType) {
            throw new Error("featureType option must be specified when creating a new VoipScreenScreenList");
        }

        // mandatory
        this.billingAccount = screenListOptions.billingAccount;
        this.serviceName = screenListOptions.serviceName;
        this.featureType = screenListOptions.featureType;

        // check for mandatory field required by ovhPabx feature type
        if (this.featureType === "ovhPabx") {
            if (!screenListOptions.dialplanId) {
                throw new Error("dialplanId option must be specified when creating a new VoipScreenScreenList");
            }
            if (!screenListOptions.extensionId) {
                throw new Error("extensionId option must be specified when creating a new VoipScreenScreenList");
            }

            this.dialplanId = screenListOptions.dialplanId;
            this.extensionId = screenListOptions.extensionId;
        }

        // from api
        this.setOptions(screenListOptions);

        // other attributes
        this.id = _.get(screenListOptions, this.featureType === "sip" ? "id" : "conditionId") || "tmp_" + _.random(_.now());
        this.state = _.get(screenListOptions, "state") || "OK";
    }

    /* -----  End of CONSTRUCTOR  ------*/

    /*= ========================================
    =            PROTOTYPE METHODS            =
    =========================================*/

    VoipScreenScreenList.prototype.setOptions = function (screenListOptions) {
        var self = this;

        self.callNumber = _.get(screenListOptions, self.featureType === "sip" ? "callNumber" : "callerIdNumber", null);
        self.type = _.get(screenListOptions, self.featureType === "sip" ? "type" : "screenListType", null);

        if (self.featureType !== "sip") {
            self.destinationNumber = _.get(screenListOptions, "destinationNumber", null);
        }

        return self;
    };

    /* ----------  API CALLS  ----------*/

    VoipScreenScreenList.prototype.create = function () {
        var self = this;

        if (self.featureType !== "ovhPabx") {
            throw new Error("create method is not yet manager for feature type " + self.featureType);
        }

        self.state = "CREATING";

        return OvhApiTelephony.OvhPabx().Dialplan().Extension().ConditionScreenList()
            .v6()
            .create({
                billingAccount: self.billingAccount,
                serviceName: self.serviceName,
                dialplanId: self.dialplanId,
                extensionId: self.extensionId
            }, {
                callerIdNumber: self.callNumber,
                screenListType: self.type
            }).$promise.then(function (screenListOptions) {
                self.id = screenListOptions.extensionId;
                self.state = "OK";
                return self;
            });
    };

    VoipScreenScreenList.prototype.remove = function () {
        var self = this;

        if (self.featureType !== "ovhPabx") {
            throw new Error("remove method is not yet manager for feature type " + self.featureType);
        }

        self.state = "DELETING";

        return OvhApiTelephony.OvhPabx().Dialplan().Extension().ConditionScreenList()
            .v6()
            .remove({
                billingAccount: self.billingAccount,
                serviceName: self.serviceName,
                dialplanId: self.dialplanId,
                extensionId: self.extensionId,
                conditionId: self.id
            }).$promise.finally(function () {
                self.state = "OK";
            });
    };

    /* -----  End of PROTOTYPE METHODS  ------*/

    return VoipScreenScreenList;
});
