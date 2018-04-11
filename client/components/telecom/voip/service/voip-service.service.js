/**
 *  @ngdoc service
 *  @name managerApp.service:voipService
 *
 *  @requires OvhApiTelephony from ovh-api-services
 *  @requires managerApp.object:VoipService
 *  @requires managerApp.object:VoipServiceAlias
 *  @requires managerApp.object:VoipServiceLine
 *
 *  @description
 *  Service that manage API calls to `/telephony/{billingAccount}/service/{serviceName}`. It will differenciate alias and line service types.
 */
angular.module("managerApp").service("voipService", class {

    constructor (OvhApiTelephony, VoipService, VoipServiceAlias, VoipServiceLine) {
        this.OvhApiTelephony = OvhApiTelephony;
        this.VoipService = VoipService;
        this.VoipServiceAlias = VoipServiceAlias;
        this.VoipServiceLine = VoipServiceLine;
    }

    /**
     *  @ngdoc method
     *  @name managerApp.service:voipService#fetchAll
     *  @methodOf managerApp.service:voipService
     *
     *  @description
     *  Get all the service of connected user using API v7.
     *
     *  @param {Boolean} [withError=true]   Either return services with error or not. Should be replaced with better filters when APIv7 will be able to filter by status code (SOON !!!).
     *
     *  @return {Promise} That return an Array of VoipService instances.
     */
    fetchAll (withError = true) {
        return this.OvhApiTelephony.Service().v7().query().aggregate("billingAccount").expand().execute().$promise.then((result) =>
            _.chain(result).filter((res) =>

                // bug on APIv7 ? Sometimes res.error is null but res.value.message contains the error message...
                // waiting for bugfix and test if message attribute is the only attribute of res.value object.
                _.has(res, "value") || (withError && (_.keys(res.value).length && _.has(res.value, "message")))
            ).map((res) => {
                let billingAccount = _.get(res.path.split("/"), "[2]");

                // same remark as above :-)
                if (res.error || (_.keys(res.value).length === 1 && _.has(res.value, "message"))) {
                    return new this.VoipService({
                        billingAccount: billingAccount,
                        serviceName: res.key,
                        error: res.error || res.value.message
                    });
                }

                // ensure that billingAccount option is setted
                _.set(res.value, "billingAccount", billingAccount);
                return this._constructService(res.value);
            }).value()
        );
    }

    /**
     *  @ngdoc method
     *  @name managerApp.service:voipService#fetchSingleService
     *  @methodOf managerApp.service:voipService
     *
     *  @description
     *  <p>Use API to get single service of given billingAccount and serviceName.</p>
     *  <p>Make a call to *GET* `/telephony/{billingAccount}/service/{serviceName}` API route.</p>
     *
     *  @param  {String} billingAccount The billingAccount to which is attached the service.
     *  @param  {String} serviceName    The unique id of the service.
     *
     *  @return {Promise}   That returns a VoipService instance representing the fetched service.
     */
    fetchSingleService (billingAccount, serviceName) {
        return this.OvhApiTelephony.Service().v6().get({
            billingAccount,
            serviceName
        }).$promise.then((result) => {
            // ensure billingAccount is setted
            _.set(result, "billingAccount", billingAccount);
            return this._constructService(result);
        });
    }

    /* =========================================
    =            Diagnostic reports            =
    ========================================== */

    /**
     *  @ngdoc method
     *  @name managerApp.service:voipService#fetchDiagnosticReports
     *  @methodOf managerApp.service:voipService
     *
     *  @description
     *  <p>Use API to fetch relevant informations of the service detected from the MOS or the signal leg in SIP/MGCP protocol.</p>
     *  <p>Make a call to *GET* `/telephony/{billingAccount}/service/{serviceName}/diagnosticReports` API route.</p>
     *
     *  @param  {String} billingAccount The billingAccount to which is attached the service.
     *  @param  {String} serviceName    The unique id of the service.
     *  @param  {String} dayInterval    Number of days from now that you want to get report.
     *
     *  @return {Promise}   That returns an Array of {@link https://eu.api.ovh.com/console/#/telephony/%7BbillingAccount%7D/service/%7BserviceName%7D/diagnosticReports#GET `telephony.DiagnosticReport`} objects.
     */
    fetchDiagnosticReports (billingAccount, serviceName, dayInterval) {
        return this.OvhApiTelephony.Service().v6().diagnosticReports({
            billingAccount,
            serviceName,
            dayInterval
        }).$promise;
    }

    /**
     *  @ngdoc method
     *  @name managerApp.service:voipService#fetchServiceDiagnosticReports
     *  @methodOf managerApp.service:voipService
     *
     *  @description
     *  <p>Same as `fetchDiagnosticReports` but taking in argument a VoipService instance.</p>
     *
     *  @param  {VoipService} service   The VoipService instance you want to fetch diagnostic reports.
     *  @param  {String} dayInterval    Number of days from now that you want to get report.
     *
     *  @return {Promise}   That returns an Array of {@link http://jean-baptiste.devs.ria.ovh.net/rico/#/telephony/%7BbillingAccount%7D/service/%7BserviceName%7D/diagnosticReports#GET `telephony.DiagnosticReport`} objects.
     */
    fetchServiceDiagnosticReports (service, dayInterval) {
        return this.fetchDiagnosticReports(service.billingAccount, service.serviceName, dayInterval);
    }

    /* -----  End of Diagnostic reports  ------ */

    /* ==============================
    =            Filters            =
    =============================== */

    /* ----------  By service type  ---------- */

    /**
     *  @ngdoc method
     *  @name managerApp.service:voipService#filterAliasServices
     *  @methodOf managerApp.service:voipService
     *
     *  @description
     *  Filter the services of given services list that match alias serviceType.
     *
     *  @param  {Array.<VoipSercice>} services The services list to filter.
     *
     *  @return {Array.<VoipSercice>} The filtered list of aliases.
     */
    filterAliasServices (services) {
        return _.filter(services, {
            serviceType: "alias"
        });
    }

    /**
     *  @ngdoc method
     *  @name managerApp.service:voipService#filterLineServices
     *  @methodOf managerApp.service:voipService
     *
     *  @description
     *  Filter the services of given services list that match line serviceType.
     *
     *  @param  {Array.<VoipSercice>} services The services list to filter.
     *
     *  @return {Array.<VoipSercice>} The filtered list of lines.
     */
    filterLineServices (services) {
        return _.filter(services, {
            serviceType: "line"
        });
    }

    /* ----------  By feature type  ---------- */

    /**
     *  @ngdoc method
     *  @name managerApp.service:voipService#filterPlugAndFaxServices
     *  @methodOf managerApp.service:voipService
     *
     *  @description
     *  Filter the services of given services list that match plugAndFax featureType.
     *
     *  @param  {Array.<VoipSercice>} services The services list to filter.
     *
     *  @return {Array.<VoipSercice>} The filtered list of plugAndFax.
     */
    filterPlugAndFaxServices (services) {
        return _.filter(services, {
            featureType: "plugAndFax"
        });
    }

    /**
     *  @ngdoc method
     *  @name managerApp.service:voipService#filterFaxServices
     *  @methodOf managerApp.service:voipService
     *
     *  @description
     *  Filter the services of given services list that match fax featureType.
     *
     *  @param  {Array.<VoipSercice>} services The services list to filter.
     *
     *  @return {Array.<VoipSercice>} The filtered list of fax.
     */
    filterFaxServices (services) {
        return _.filter(services, (service) =>
            ["fax", "voicefax"].indexOf(service.featureType) > -1
        );
    }

    /* -----  End of Filters  ------ */

    /**
     *  @ngdoc method
     *  @name managerApp.service:voipService#sortServicesByDisplayedName
     *  @methodOf managerApp.service:voipService
     *
     *  @description
     *  Sort given services list by displayed name.
     *
     *  @param  {Array.<VoipSercice>} services List of services to be sorted.
     *
     *  @return {Array.<VoipSercice>}   The sorted list of services.
     */
    sortServicesByDisplayedName (services) {
        return angular.copy(services).sort((first, second) =>
            first.getDisplayedName().localeCompare(second.getDisplayedName())
        );
    }

    /* ==============================
    =            Private            =
    =============================== */

    /**
     *  @description
     *  Construct the good service type instance from the serviceTypeOptions.
     *  An error is throwned if the serviceType is not supported.
     *
     *  @private
     *
     *  @param  {Object} options The options needed for creating a new VoipService instance (see VoipService constructor for more details).
     *  @return {VoipService}    The good instance type of VoipService.
     */
    _constructService (options) {
        switch (options.serviceType) {
        case "alias":
            return new this.VoipServiceAlias(options);
        case "line":
            return new this.VoipServiceLine(options);
        default:
            throw new Error(`${options.serviceType} serviceType is not supported`);
        }
    }

    /* -----  End of Private  ------ */


});
