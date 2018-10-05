angular.module('managerApp').controller('TelecomPackMigrationBuildingDetailsCtrl', function ($q, $translate, PackMigrationProcess, OvhContact, OvhApiPackXdsl, OvhApiConnectivityEligibility) {
  const self = this;

  self.process = null;
  self.loading = {
    init: false,
  };
  self.model = {
    engageMonths: null,
    selectedBuilding: null,
    selectedStair: null,
    selectedFloor: null,
  };

  /*= ==============================
  =            ACTIONS            =
  =============================== */

  self.cancelMigration = function () {
    PackMigrationProcess.cancelMigration();
  };

  self.nextStep = function () {
    self.process.selectedOffer.buildingReference = self.model.selectedBuilding.reference;
    self.process.selectedOffer.engageMonths = self.model.engageMonths;
    self.process.selectedOffer.stair = self.model.selectedStair.stair.value;
    self.process.selectedOffer.floor = self.model.selectedFloor.value;

    console.log(self.process.selectedOffer);
    if (self.process.selectedOffer.totalSubServiceToDelete > 0) {
      self.process.currentStep = 'serviceDelete';
    } else if (self.process.selectedOffer.needNewModem) {
      self.process.currentStep = 'shipping';
    } else {
      self.process.currentStep = 'confirm';
    }
  };

  self.isValidSelection = function () {
    if (self.model.engageMonths != null && self.model.selectedBuilding != null
      && self.model.selectedStair != null && self.model.selectedFloor != null) {
      return true;
    }
    return false;
  };

  function convertStairs(stair) {
    const stairsModel = {};
    if (stair.stair === '_NA_') {
      stairsModel.stair = {
        label: $translate.instant('telecom_pack_migration_building_details_none'),
        value: stair.stair,
      };
    } else {
      stairsModel.stair = {
        label: stair.stair,
        value: stair.stair,
      };
    }

    if (stair.floors[0] === '_NA_') {
      stairsModel.floors = [{
        label: $translate.instant('telecom_pack_migration_building_details_none'),
        value: stair.floors[0],
      }];
    } else {
      stairsModel.floors = [];
      stair.floors.forEach((floor) => {
        stairsModel.floors.push({ label: floor, value: floor });
      });
    }
    return stairsModel;
  }

  self.changeSelection = function (isFromStairs) {
    if (!isFromStairs) {
      if (self.model.selectedBuilding.stairs === undefined) {
        // Reload stairs and floors from APIv6 for building reference
        const params = {
          building: self.model.selectedBuilding.reference,
        };
        OvhApiConnectivityEligibility.v6().buildingDetails({
        }, params).$promise.then((buildingDetails) => {
          if (buildingDetails.result && buildingDetails.result.stairs) {
            const stairs = [];
            buildingDetails.result.stairs.forEach((stair) => {
              stairs.push(convertStairs(stair));
            });
            self.model.selectedBuilding.stairs = stairs;
          }
        });
      }
      if (self.model.selectedStair != null) {
        self.model.selectedStair = null;
      }
      if (self.model.selectedFloor != null) {
        self.model.selectedFloor = null;
      }
    } else {
      self.model.selectedFloor = null;
    }
  };

  /* -----  End of ACTIONS  ------*/

  /*= =====================================
  =            INITIALIZATION            =
  ====================================== */
  function init() {
    self.loading.init = true;

    self.process = PackMigrationProcess.getMigrationProcess();

    console.log(self.process.selectedOffer);

    self.process.selectedOffer.buildings.forEach((building, i) => {
      // check if the building name is empty to set a name to display in the select component
      if (building.name === '') {
        self.process.selectedOffer.buildings[i].name = $translate.instant('telecom_pack_migration_building_details_unknown');
      }

      const params = {
        building: building.reference,
      };
      OvhApiConnectivityEligibility.v6().buildingDetails({
      }, params).$promise.then((buildingDetails) => {
        if (buildingDetails.result && buildingDetails.result.stairs) {
          const stairs = [];
          buildingDetails.result.stairs.forEach((stair) => {
            stairs.push(convertStairs(stair));
          });
          self.process.selectedOffer.buildings[i].stairs = stairs;
        }
      });
    });
    self.loading.init = false;
  }

  /* -----  End of INITIALIZATION  ------*/

  init();
});
