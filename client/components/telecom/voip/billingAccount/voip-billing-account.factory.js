angular.module("managerApp").factory("VoipBillingAccount", function (VoipService) {
    "use strict";

    const mandatoryOptions = ["billingAccount"];

    class VoipBillingAccount {
        constructor (options = {}) {
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
            this.services = [];
        }

        /**
         *  @description
         *  Get the displayed name of the billing account.
         *
         *  @return {String} The displayedName of the billingAccount (the description if provided, the billingAccount value otherwise).
         */
        getDisplayedName () {
            return this.description || this.billingAccount;
        }

        /* ======================================
        =            Service section            =
        ======================================= */

        /**
         *  @description
         *  Add a service to billing account services list.
         *
         *  @param {Object|VoipService} service     The options for creating a new VoipService instance or a VoipService object.
         *
         *  @return {VoipService} The VoipService instance added to the services list.
         */
        addService (service) {
            var addedService = service.constructor.name !== "VoipService" ? service : new VoipService(service);
            this.services.push(addedService);
            return addedService;
        }

        /**
         *  @description
         *  Add one or many services to the billing account services list.
         *
         *  @param {Array} services     A list of objects with options for adding VoipService or VoipService instances to billing account services list.
         *
         *  @return {Array.<VoipSercice>} The list of all the services of the billing account.
         */
        addServices (services) {
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

    }

    return VoipBillingAccount;

});
