/**
 *  @ngdoc service
 *  @name managerApp.service:voipLinePhone
 *
 *  @description
 *  <p>Service that manage phone linked to sip and mgcp features of services with serviceType line.</p>
 *  <p>This service will manage API calls to `/telephony/{billingAccount}/line/{serviceName}/phone`</p>
 */
angular.module("managerApp").service("voipLinePhone", class {

    constructor (VoipLinePhone, voipService, OvhApiTelephony) {
        this.VoipLinePhone = VoipLinePhone;
        this.voipService = voipService;
        this.OvhApiTelephony = OvhApiTelephony;
    }

    /**
     *  @ngdoc method
     *  @name managerApp.service:voipLinePhone#fetchAll
     *  @methodOf managerApp.service:voipLinePhone
     *
     *  @description
     *  Fetch all phone of all services of serviceType line with featureType sip or mgcp from any billingAccount. This use APIv7 with wildcard and aggregation to achieve it.
     *
     *  @return {Promise}   That return an array of VoipLinePhone instances.
     */
    fetchAll () {
        return this.OvhApiTelephony.Line().Phone().v7().query().aggregate("billingAccount").aggregate("serviceName").expand().execute().$promise.then((results) => {
            let phoneList = [];

            results.forEach((result) => {
                // first retrieve billingAccount and serviceName from path
                let splittedPath = result.path.split("/");

                // extend phone options
                let phoneOptions = angular.extend(result.value, {
                    billingAccount: splittedPath[2],
                    serviceName: splittedPath[4]
                });

                phoneList.push(new this.VoipLinePhone(phoneOptions));
            });

            return phoneList;
        });
    }

});
