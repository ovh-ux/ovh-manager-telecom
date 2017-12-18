angular.module("managerApp").service("voipService", class {

    constructor (OvhApiTelephony, VoipService, VoipServiceAlias, VoipServiceLine) {
        this.ovhApiTelephony = OvhApiTelephony;
        this.VoipService = VoipService;
        this.VoipServiceAlias = VoipServiceAlias;
        this.VoipServiceLine = VoipServiceLine;
    }

    /**
     *  @description
     *  Get all the service of connected user.
     *
     *  @param {Boolean} [withError=true]   Either return billingAccounts and services with error or not. Should be replaced with better filters when APIv7 will be able to filter by status code (SOON !!!).
     *
     *  @return {Promise} That return an Array of VoipService instances.
     */
    getAll (withError = true) {
        return this.ovhApiTelephony.Service().Erika().query().aggregate("billingAccount").expand().execute().$promise.then((result) =>
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
     *  @description
     *  Use API to get single service of given billingAccount and serviceName
     *
     *  @param  {String} billingAccount The billingAccount to which is attached the service.
     *  @param  {String} serviceName    The unique id of the service.
     *
     *  @return {Promise}   That returns a VoipService instance representing the service fetched.
     */
    fecthSingleService (billingAccount, serviceName) {
        return this.ovhApiTelephony.Service().Lexi().get({
            billingAccount: billingAccount,
            serviceName: serviceName
        }).$promise.then((result) => {
            // ensure billingAccount is setted
            _.set(result, "billingAccount", billingAccount);
            return this._constructService(result);
        });
    }

    /* ==============================
    =            Filters            =
    =============================== */

    /* ----------  By service type  ---------- */

    /**
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
     *  @description
     *  Filter the services of given services list that match fax featureType.
     *
     *  @param  {Array.<VoipSercice>} services The services list to filter.
     *
     *  @return {Array.<VoipSercice>} The filtered list of fax.
     */
    filterFaxServices (services) {
        return _.filter(services, {
            featureType: "fax"
        });
    }

    /* -----  End of Filters  ------ */

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
