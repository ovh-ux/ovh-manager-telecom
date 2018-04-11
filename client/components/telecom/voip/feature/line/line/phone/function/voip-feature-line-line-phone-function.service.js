/**
 *  @ngdoc service
 *  @name managerApp.service:voipLinePhoneFunction
 *
 *  @description
 *  <p>Service that manage function keys of phone linked to sip and mgcp features of services with serviceType line.</p>
 *  <p>This service will manage API calls to `/telephony/{billingAccount}/line/{serviceName}/phone/functionKey/{keyNum}`</p>
 */
angular.module("managerApp").service("voipLinePhoneFunction", class {

    constructor ($q, OvhApiTelephony, VoipLinePhoneFunction) {
        this.$q = $q;
        this.OvhApiTelephony = OvhApiTelephony;
        this.VoipLinePhoneFunction = VoipLinePhoneFunction;
    }

    /**
     * @ngdoc method
     * @name managerApp.service:voipLinePhoneFunction#fetchAll
     * @methodOf managerApp.service:voipLinePhoneFunction
     *
     * @description
     *  Fetch all function keys of all phone of all services of serviceType line with featureType sip or mgcp from any billingAccount. This use APIv7 with wildcard and aggregation to achieve it.
     *
     * @return {Promise}  That return an array of VoipLinePhoneFunction instances.
     */
    fetchAll () {
        return this.OvhApiTelephony.Line().Phone().FunctionKey().v7().query().aggregate("billingAccount").aggregate("serviceName").aggregate("keyNum").expand().execute().$promise.then((phoneResults) =>
            phoneResults.map((phone) => {
                let splittedPath = phone.path.split("/");

                let functionKeysOptions = angular.extend(phone.value, {
                    billingAccount: splittedPath[2],
                    serviceName: splittedPath[4]
                });

                return new this.VoipLinePhoneFunction(functionKeysOptions);
            })
        );
    }
});
