import angular from 'angular';
import _ from 'lodash';

/**
 *  @ngdoc service
 *  @name managerApp.service:tucVoipService
 *
 *  @requires OvhApiTelephony from ovh-api-services
 *  @requires managerApp.object:TucVoipService
 *  @requires managerApp.object:TucVoipServiceAlias
 *  @requires managerApp.object:TucVoipServiceLine
 *
 *  @description
 *  Service that manage API calls to `/telephony/{billingAccount}/service/{serviceName}`.
 *  It will differenciate alias and line service types.
 */
export default class {
  constructor(OvhApiTelephony, TucVoipService, TucVoipServiceAlias, TucVoipServiceLine) {
    'ngInject';

    this.OvhApiTelephony = OvhApiTelephony;
    this.TucVoipService = TucVoipService;
    this.TucVoipServiceAlias = TucVoipServiceAlias;
    this.TucVoipServiceLine = TucVoipServiceLine;
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:tucVoipService#fetchAll
   *  @methodOf managerApp.service:tucVoipService
   *
   *  @description
   *  Get all the service of connected user using API v7.
   *
   *  @param {Boolean} [withError=true]   Either return services with error or not.
   *                                      Should be replaced with better filters when APIv7
   *                                      will be able to filter by status code (SOON !!).
   *
   *  @return {Promise} That return an Array of TucVoipService instances.
   */
  fetchAll(withError = true) {
    return this.OvhApiTelephony.Service().v7().query().aggregate('billingAccount')
      .expand()
      .execute().$promise.then(result => _.chain(result).filter(res => _.has(res, 'value') || (withError && (_.keys(res.value).length && _.has(res.value, 'message')))).map((res) => {
        const billingAccount = _.get(res.path.split('/'), '[2]');

        // same remark as above :-)
        if (res.error || (_.keys(res.value).length === 1 && _.has(res.value, 'message'))) {
          return new this.TucVoipService({
            billingAccount,
            serviceName: res.key,
            error: res.error || res.value.message,
          });
        }

        // ensure that billingAccount option is setted
        _.set(res.value, 'billingAccount', billingAccount);
        return this._constructService(res.value); // eslint-disable-line
      }).value());
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:tucVoipService#fetchSingleService
   *  @methodOf managerApp.service:tucVoipService
   *
   *  @description
   *  <p>Use API to get single service of given billingAccount and serviceName.</p>
   *  <p>Make a call to *GET* `/telephony/{billingAccount}/service/{serviceName}` API route.</p>
   *
   *  @param  {String} billingAccount The billingAccount to which is attached the service.
   *  @param  {String} serviceName    The unique id of the service.
   *
   *  @return {Promise}   That returns a TucVoipService instance representing the fetched service.
   */
  fetchSingleService(billingAccount, serviceName) {
    return this.OvhApiTelephony.Service().v6().get({
      billingAccount,
      serviceName,
    }).$promise.then((result) => {
      // ensure billingAccount is setted
      _.set(result, 'billingAccount', billingAccount);
      return this._constructService(result); // eslint-disable-line
    });
  }

  /* =========================================
    =            Diagnostic reports            =
    ========================================== */

  /**
   *  @ngdoc method
   *  @name managerApp.service:tucVoipService#fetchDiagnosticReports
   *  @methodOf managerApp.service:tucVoipService
   *
   *  @description
   *  <p>Use API to fetch relevant informations of the service detected from the MOS
   *    or the signal leg in SIP/MGCP protocol.</p>
   *  <p>Make a call to *GET* `/telephony/{billingAccount}/service/{serviceName}/diagnosticReports`
   *    API route.</p>
   *
   *  @param  {String} billingAccount The billingAccount to which is attached the service.
   *  @param  {String} serviceName    The unique id of the service.
   *  @param  {String} dayInterval    Number of days from now that you want to get report.
   *
   *  @return {Promise}   That returns an Array of {@link https://eu.api.ovh.com/console/#/telephony/%7BbillingAccount%7D/service/%7BserviceName%7D/diagnosticReports#GET `telephony.DiagnosticReport`} objects.
   */
  fetchDiagnosticReports(billingAccount, serviceName, dayInterval) {
    return this.OvhApiTelephony.Service().v6().diagnosticReports({
      billingAccount,
      serviceName,
      dayInterval,
    }).$promise;
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:tucVoipService#fetchServiceDiagnosticReports
   *  @methodOf managerApp.service:tucVoipService
   *
   *  @description
   *  <p>Same as `fetchDiagnosticReports` but taking in argument a TucVoipService instance.</p>
   *
   *  @param  {TucVoipService} service   The TucVoipService instance you want to fetch
   *                                     diagnostic reports.
   *  @param  {String} dayInterval    Number of days from now that you want to get report.
   *
   *  @return {Promise}   That returns an Array of {@link http://jean-baptiste.devs.ria.ovh.net/rico/#/telephony/%7BbillingAccount%7D/service/%7BserviceName%7D/diagnosticReports#GET `telephony.DiagnosticReport`} objects.
   */
  fetchServiceDiagnosticReports(service, dayInterval) {
    return this.fetchDiagnosticReports(service.billingAccount, service.serviceName, dayInterval);
  }

  /* -----  End of Diagnostic reports  ------ */

  /* ==============================
    =            Filters            =
    =============================== */

  /* ----------  By service type  ---------- */

  /**
   *  @ngdoc method
   *  @name managerApp.service:tucVoipService#filterAliasServices
   *  @methodOf managerApp.service:tucVoipService
   *
   *  @description
   *  Filter the services of given services list that match alias serviceType.
   *
   *  @param  {Array.<VoipSercice>} services The services list to filter.
   *
   *  @return {Array.<VoipSercice>} The filtered list of aliases.
   */
  static filterAliasServices(services) {
    return _.filter(services, {
      serviceType: 'alias',
    });
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:tucVoipService#filterLineServices
   *  @methodOf managerApp.service:tucVoipService
   *
   *  @description
   *  Filter the services of given services list that match line serviceType.
   *
   *  @param  {Array.<VoipSercice>} services The services list to filter.
   *
   *  @return {Array.<VoipSercice>} The filtered list of lines.
   */
  static filterLineServices(services) {
    return _.filter(services, {
      serviceType: 'line',
    });
  }

  /* ----------  By feature type  ---------- */

  /**
   *  @ngdoc method
   *  @name managerApp.service:tucVoipService#filterPlugAndFaxServices
   *  @methodOf managerApp.service:tucVoipService
   *
   *  @description
   *  Filter the services of given services list that match plugAndFax featureType.
   *
   *  @param  {Array.<VoipSercice>} services The services list to filter.
   *
   *  @return {Array.<VoipSercice>} The filtered list of plugAndFax.
   */
  static filterPlugAndFaxServices(services) {
    return _.filter(services, {
      featureType: 'plugAndFax',
    });
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:tucVoipService#filterFaxServices
   *  @methodOf managerApp.service:tucVoipService
   *
   *  @description
   *  Filter the services of given services list that match fax featureType.
   *
   *  @param  {Array.<VoipSercice>} services The services list to filter.
   *
   *  @return {Array.<VoipSercice>} The filtered list of fax.
   */
  static filterFaxServices(services) {
    return _.filter(services, service => ['fax', 'voicefax'].indexOf(service.featureType) > -1);
  }

  /* -----  End of Filters  ------ */

  /**
   *  @ngdoc method
   *  @name managerApp.service:tucVoipService#sortServicesByDisplayedName
   *  @methodOf managerApp.service:tucVoipService
   *
   *  @description
   *  Sort given services list by displayed name.
   *
   *  @param  {Array.<VoipSercice>} services List of services to be sorted.
   *
   *  @return {Array.<VoipSercice>}   The sorted list of services.
   */
  static sortServicesByDisplayedName(services) {
    return angular.copy(services)
      .sort((first, second) => first.getDisplayedName().localeCompare(second.getDisplayedName()));
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
   *  @param  {Object} options The options needed for creating a new TucVoipService instance
   *                           (see TucVoipService constructor for more details).
   *  @return {TucVoipService}    The good instance type of TucVoipService.
   */
  _constructService(options) {
    switch (options.serviceType) {
      case 'alias':
        return new this.TucVoipServiceAlias(options);
      case 'line':
        return new this.TucVoipServiceLine(options);
      default:
        throw new Error(`${options.serviceType} serviceType is not supported`);
    }
  }

  /* -----  End of Private  ------ */
}
