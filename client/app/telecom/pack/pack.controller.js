angular.module('managerApp')
  .controller('PackCtrl', function (
    $scope, $stateParams, $q, $translate,
    OvhApiPackXdsl, Toast, SidebarMenu, resiliationNotification,
    DASHBOARD, PACK,
  ) {
    const self = this;

    this.loader = {
      page: true,
      service: true,
    };

    /**
     * Get all services for this pack
     * @param {string} packId Identifier of the pack
     * @returns {Promise}
     */
    this.getAllFrames = function (packId) {
      const promises = [];

      // get all Services
      promises.push(OvhApiPackXdsl.v6().getServices({
        packId,
      }).$promise.then((services) => {
        const filteredServices = _.chain(services)
          .filter(service => DASHBOARD.services.indexOf(service.name) > -1)
          .map((service) => {
            let index = DASHBOARD.services.indexOf(service.name);
            if (index === -1) {
              index = DASHBOARD.services.length;
            }

            _.set(service, 'index', index + 1);

            return service;
          })
          .value();

        self.frames = self.frames.concat(filteredServices);
      }));

      // Append task frame if tasks are pending
      promises.push(OvhApiPackXdsl.Tasks().v6().query({
        packName: packId,
      }).$promise.then((data) => {
        if (data.length) {
          self.frames.push(PACK.frames.task);
        }
        return data;
      }));

      // Check for a promotion code
      promises.push(OvhApiPackXdsl.PromotionCode().v6().capabilities({
        packId: $stateParams.packName,
      }).$promise.then((capabilities) => {
        if (capabilities.canGenerate) {
          const promotionCodeFrame = _.clone(PACK.frames.promotionCode);
          promotionCodeFrame.data = capabilities;
          self.frames.push(promotionCodeFrame);
        }
        return capabilities;
      }));

      return $q.all(promises);
    };

    /**
     * Get pack informations
     * @return {Promise}
     */
    this.getPackInformation = function () {
      this.loader.page = true;
      return OvhApiPackXdsl.Aapi().get({
        packId: $stateParams.packName,
      }).$promise.then((packInfo) => {
        self.pack = _.extend(
          packInfo.general,
          {
            informations: packInfo.detail,
            mainAccess: _.head(packInfo.services),
          },
        );
        self.resiliationSuccess = resiliationNotification.success;
        _.set(resiliationNotification, 'success', false); // display only once
        self.cancelResiliationSuccess = resiliationNotification.cancelSuccess;
        _.set(resiliationNotification, 'cancelSuccess', false); // display only once
        return packInfo;
      }).catch((err) => {
        self.inError = true;
        Toast.error($translate.instant('pack_xdsl_oops_an_error_is_occured'));
        return $q.reject(err);
      }).finally(() => {
        self.loader.page = false;
      });
    };

    /**
     * Validate email
     * @param {string} email Email address
     * @return {boolean}
     */
    this.checkEmailAddress = function (email) {
      return validator.isEmail(email);
    };

    /**
     * Initialize the frame list
     * @return {Promise}
     */
    this.initFrames = function () {
      this.loader.service = true;
      this.frames = [PACK.frames.informations];

      return self.getAllFrames($stateParams.packName).catch((err) => {
        if (err.status !== 460 && err.status !== 403) {
          Toast.error([$translate.instant('pack_xdsl_oops_an_error_is_occured'), err.data ? err.data.message : ''].join(' '));
        }
        return $q.reject(err);
      }).finally(() => {
        self.loader.service = false;
      });
    };

    /*= ==============================
    =            ACTIONS            =
    =============================== */

    self.packDescriptionSave = function (newPackDescr) {
      self.loader.save = true;

      return OvhApiPackXdsl.v6().put({
        packId: $stateParams.packName,
      }, {
        description: newPackDescr,
      }).$promise.then(() => {
        self.pack.description = newPackDescr;

        // rename in sidebar menu
        SidebarMenu.updateItemDisplay({
          title: newPackDescr || self.pack.offerDescription,
        }, $stateParams.packName, 'telecom-pack-section');
      }, (error) => {
        Toast.error([$translate.instant('pack_rename_error', $stateParams), error.data.message].join(' '));
        return $q.reject(error);
      }).finally(() => {
        self.loader.save = false;
      });
    };

    /* -----  End of ACTIONS  ------*/

    /**
     * Initialize the controller
     */
    this.$onInit = function () {
      this.inError = false;

      return $q.all({
        packInformation: this.getPackInformation(),
        frames: this.initFrames(),
      }).then(() => {
        if (_.isArray(self.frames)) {
          self.services = _.chain(self.frames)
            .sortByOrder(['index'])

          // transform a  [1 x l] matrix to a [2 x l/2] matrix
            .reduce((all, elt, index) => {
              let line = [];
              if (index % 2) {
                line = _.last(all);
              } else {
                all.push(line);
              }
              line.push(elt);
              return all;
            }, [])
            .value();
        }
        return self.services;
      });
    };

    $scope.$on('reload-frames', () => {
      self.$onInit();
    });
  });
