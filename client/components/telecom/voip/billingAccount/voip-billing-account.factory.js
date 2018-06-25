/**
 *  @ngdoc object
 *  @name managerApp.object:VoipBillingAccount
 *
 *  @description
 *  <p>Factory that describes a billingAccount with attributes
 *    returned by `/telephony/{billingAccount}` API.</p>
 *  <p>See {@link https://api.ovh.com/console/#/telephony/%7BbillingAccount%7D#GET `telephony.BillingAccount` enum} for available properties.</p>
 *  <p>Others "custom properties" are listed in **Properties** section bellow.</p>
 *
 *  @constructor
 *  @param {Object} options Options required for creating a new instance of VoipBillingAccount (see {@link https://api.ovh.com/console/#/telephony/%7BbillingAccount%7D#GET `telephony.BillingAccount` enum}
 *  for availables options properties).
 *
 *  Note that `billingAccount` option is mandatory.
 */
angular.module('managerApp').factory('VoipBillingAccount', (VoipService, voipService) => {
  const mandatoryOptions = ['billingAccount'];

  class VoipBillingAccount {
    constructor(options = {}) {
      // check for mandatory options
      mandatoryOptions.forEach((option) => {
        if (!options[option]) {
          throw new Error(`${option} option must be specified when creating a new VoipBillingAccount`);
        }
      });

      // populate object attributes
      // mandatory attribute
      this.billingAccount = options.billingAccount;

      // populate error (if some)
      this.error = options.error;

      // populate other attributes
      this.description = options.description;
      this.status = options.status;
      this.overrideDisplayedNumber = options.overrideDisplayedNumber;
      this.trusted = options.trusted;
      this.hiddenExternalNumber = options.hiddenExternalNumber;
      this.securityDeposit = options.securityDeposit;
      this.currentOutplan = options.currentOutplan;
      this.allowedOutplan = options.allowedOutplan;
      this.creditThreshold = options.creditThreshold;

      // custom attributes (not from API)
      /**
       *  @ngdoc property
       *  @name managerApp.object:VoipBillingAccount#services
       *  @propertyOf managerApp.object:VoipBillingAccount
       *
       *  @description
       *  <p>Store the services attached to the VoipBillingAccount instance.</p>
       *  <p>You can populate this services list with `addService` method
       *    or with `addServices` method.</p>
       *
       *  @return {Array.<VoipService>} An array of `VoipService` instances.
       */
      this.services = [];
    }

    /**
     *  @ngdoc method
     *  @name managerApp.object:VoipBillingAccount#getDisplayedName
     *  @methodOf managerApp.object:VoipBillingAccount
     *
     *  @description
     *  Get the displayed name of the billing account.
     *
     *  @return {String} The displayedName of the billingAccount
     *                   (the description if provided, the billingAccount value otherwise).
     */
    getDisplayedName() {
      return this.description || this.billingAccount;
    }

    /* ======================================
        =            Service section            =
        ======================================= */

    /**
     *  @ngdoc method
     *  @name managerApp.object:VoipBillingAccount#addService
     *  @methodOf managerApp.object:VoipBillingAccount
     *
     *  @description
     *  Add a service to billing account services list.
     *  If service already exists in list (meaning that a service with `serviceName`
     *  option is already in the list), the existing service will be replaced by a service with
     *  the new options passed in arguments.
     *
     *  @param {Object|VoipService} service     The options for creating a new VoipService instance
     *                                          or a VoipService object.
     *
     *  @return {VoipService} The VoipService instance added (or replaced) to the services list.
     */
    addService(service) {
      const addedService = service.constructor.name !== 'VoipService' ? service : new VoipService(service);

      // check if service is already added
      const serviceIndex = _.findIndex(this.services, {
        serviceName: addedService.serviceName,
      });

      if (serviceIndex !== -1) {
        // if service exists - replace it
        this.services.splice(serviceIndex, 1, addedService);
      } else {
        // if service not exists - add it to the list
        this.services.push(addedService);
      }

      return addedService;
    }

    /**
     *  @ngdoc method
     *  @name managerApp.object:VoipBillingAccount#addServices
     *  @methodOf managerApp.object:VoipBillingAccount
     *
     *  @description
     *  Add one or many services to the billing account services list.
     *
     *  @param {Array.<Object>|Object} services     An object or a list of objects with options
     *                                              for adding VoipService instances to billing
     *                                              account services list.
     *
     *  @return {Array.<VoipSercice>} The list of all the services of the billing account
     *                                (including added services).
     */
    addServices(services) {
      if (!angular.isArray(services)) {
        this.addService(services);
      } else {
        services.forEach((service) => {
          this.addService(service);
        });
      }

      return this.services;
    }

    /* -----  End of Service section  ------ */

    /* ==============================
    =            Filters            =
    =============================== */

    /* ----------  By service type  ---------- */

    /**
     *  @ngdoc method
     *  @name managerApp.object:VoipBillingAccount#getAlias
     *  @methodOf managerApp.object:VoipBillingAccount
     *
     *  @description
     *  Get the services of the billingAccount that match `alias` serviceType.
     *
     *  @return {Array.<VoipSercice>} The list of all services with serviceType alias
     *                                of the billing account.
     */
    getAlias() {
      return voipService.constructor.filterAliasServices(this.services);
    }

    /**
     *  @ngdoc method
     *  @name managerApp.object:VoipBillingAccount#getLines
     *  @methodOf managerApp.object:VoipBillingAccount
     *
     *  @description
     *  Get the services of the billingAccount that match line serviceType.
     *
     *  @return {Array.<VoipSercice>} The list of all services with serviceType line
     *                                of the billing account.
     */
    getLines() {
      return voipService.constructor.filterLineServices(this.services);
    }

    /* ----------  By feature type  ---------- */

    /* -----  End of Filters  ------ */
  }

  return VoipBillingAccount;
});
