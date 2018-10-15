angular.module('managerApp').controller('TelecomTelephonyAliasConfigurationCtrl', function ($q, $stateParams, $translate, atInternet, OvhApiMe, TelephonyMediator, Toast) {
  const self = this;

  self.loading = {
    init: false,
  };

  self.actions = null;
  self.number = null;

  /*= ==============================
    =            HELPERS            =
    =============================== */

  function getFeatureTypeActions() {
    const ovhPabxActions = [{
      divider: true,
    }];

    const easyHuntingActions = [{
      name: 'number_easy_hunting_mode',
      sref: 'telecom.telephony.alias.configuration.mode.easyHunting',
      text: $translate.instant('telephony_alias_configuration_actions_number_hunting_mode'),
    }, {
      name: 'number_easy_hunting_members',
      sref: 'telecom.telephony.alias.configuration.members.easyHunting',
      text: $translate.instant('telephony_alias_configuration_actions_number_hunting_members'),
    }, {
      name: 'number_easy_hunting_slots',
      sref: 'telecom.telephony.alias.configuration.timeCondition.easyHunting',
      text: $translate.instant('telephony_alias_configuration_actions_number_hunting_slots'),
    }, {
      name: 'number_easy_hunting_events',
      sref: 'telecom.telephony.alias.configuration.scheduler.easyHunting',
      text: $translate.instant('telephony_alias_configuration_actions_number_hunting_events'),
    }, {
      name: 'number_easy_hunting_filtering',
      sref: 'telecom.telephony.alias.configuration.callsFiltering.easyHunting',
      text: $translate.instant('telephony_alias_configuration_actions_number_hunting_filtering'),
    }];

    switch (self.number.getFeatureFamily()) {
      case 'redirect':
      case 'svi':
        return [];
      case 'ovhPabx':
        // add member/agent and queues for cloudHunting
        if (self.number.feature.featureType !== 'cloudIvr') {
          // agents for "CCS expert" - members for "File d'appel expert"
          ovhPabxActions.push(self.number.feature.featureType === 'contactCenterSolutionExpert' ? {
            name: 'number_cloud_hunting_agents',
            sref: 'telecom.telephony.alias.configuration.agents.ovhPabx',
            text: $translate.instant('telephony_alias_configuration_actions_number_hunting_agents'),
          } : {
            name: 'number_easy_hunting_members',
            sref: 'telecom.telephony.alias.configuration.agents.ovhPabx',
            text: $translate.instant('telephony_alias_configuration_actions_number_hunting_members'),
          });

          // queue for both "CCS expert" and "File d'appel expert"
          ovhPabxActions.push({
            name: 'number_cloud_hunting_queues',
            sref: 'telecom.telephony.alias.configuration.queues.ovhPabx',
            text: $translate.instant('telephony_alias_configuration_actions_number_hunting_queues'),
          });
        }

        // add menu link exept for "File d'appel expert"
        if (self.number.feature.featureType === 'cloudIvr' || self.number.feature.featureType === 'contactCenterSolutionExpert') {
          ovhPabxActions.push({
            name: 'number_ovh_pabx_menus',
            sref: 'telecom.telephony.alias.configuration.ovhPabx.menus',
            text: $translate.instant('telephony_alias_configuration_actions_menus_management'),
          });
        }

        // add tts link for "CCS expert"
        if (self.number.feature.featureType === 'contactCenterSolutionExpert') {
          ovhPabxActions.push({
            name: 'number_ovh_pabx_tts',
            sref: 'telecom.telephony.alias.configuration.ovhPabx.tts',
            text: $translate.instant('telephony_alias_configuration_actions_tts_management'),
          });
        }

        // add links for all : "CCS expert", "Serveur Vocal interactif" and "File d'appel expert"
        // sound
        // events
        ovhPabxActions.push({
          name: 'number_ovh_pabx_sounds',
          sref: 'telecom.telephony.alias.configuration.ovhPabx.sounds',
          text: $translate.instant('telephony_alias_configuration_actions_sounds_management'),
        }, {
          divider: true,
        }, {
          name: 'number_cloud_hunting_events',
          sref: 'telecom.telephony.alias.configuration.scheduler.ovhPabx',
          text: $translate.instant('telephony_alias_configuration_actions_number_cloud_hunting_events'),
        });

        // add links for hunting board and hunting records for "CCS expert"
        if (self.number.feature.featureType === 'contactCenterSolutionExpert') {
          ovhPabxActions.push({
            divider: true,
          }, {
            name: 'number_cloud_hunting_board',
            sref: 'telecom.telephony.alias.configuration.stats.ovhPabx',
            text: $translate.instant('telephony_alias_configuration_actions_number_hunting_board'),
          }, {
            name: 'number_cloud_hunting_records',
            sref: 'telecom.telephony.alias.configuration.records.ovhPabx',
            text: $translate.instant('telephony_alias_configuration_actions_number_hunting_records'),
          });
        }

        return ovhPabxActions;
      case 'easyHunting':
        if (self.number.feature.isCcs()) {
          // if it is a CCS => add records management page link
          easyHuntingActions.push({
            name: 'number_easy_hunting_board',
            sref: 'telecom.telephony.alias.configuration.stats.easyHunting',
            text: $translate.instant('telephony_alias_configuration_actions_number_hunting_board'),
          }, {
            name: 'number_cloud_hunting_records',
            sref: 'telecom.telephony.alias.configuration.records.ovhPabx',
            text: $translate.instant('telephony_alias_configuration_actions_number_hunting_records'),
          });
        }
        return easyHuntingActions;
      case 'easyPabx':
      case 'miniPabx':
        return [{
          name: 'number_old_pabx_mode',
          sref: `telecom.telephony.alias.configuration.mode.${self.number.feature.featureType}`,
          text: $translate.instant('telephony_alias_configuration_actions_number_hunting_mode'),
        }, {
          name: 'number_old_pabx_members',
          sref: 'telecom.telephony.alias.configuration.members.oldPabx',
          text: $translate.instant('telephony_alias_configuration_actions_number_hunting_members'),
        }, {
          name: 'number_old_pabx_tones',
          sref: 'telecom.telephony.alias.configuration.tones.oldPabx',
          text: $translate.instant('telephony_alias_configuration_actions_music_management'),
        }, {
          name: 'number_old_pabx_time_condition',
          sref: 'telecom.telephony.alias.configuration.timeCondition.oldPabx',
          text: $translate.instant('telephony_alias_configuration_actions_number_hunting_slots'),
        }, {
          name: 'number_old_pabx_scheduler',
          sref: 'telecom.telephony.alias.configuration.scheduler.oldPabx',
          text: $translate.instant('telephony_alias_configuration_actions_number_hunting_events'),
        }, {
          name: 'number_old_pabx_screen_list',
          sref: 'telecom.telephony.alias.configuration.callsFiltering.oldPabx',
          text: $translate.instant('telephony_alias_configuration_actions_number_hunting_filtering'),
        }];
      default:
        return [];
    }
  }

  self.isSubwayPlanActive = function () {
    return ['redirect', 'svi', 'ovhPabx', 'conference'].indexOf(self.number.getFeatureFamily()) > -1;
  };

  /* -----  End of HELPERS  ------*/

  /*= =====================================
  =            INITIALIZATION            =
  ====================================== */

  function initActions() {
    return [{
      name: 'number_modification_new',
      sref: 'telecom.telephony.alias.configuration.changeType',
      text: $translate.instant('telephony_alias_configuration_actions_number_modification_new'),
    }].concat(getFeatureTypeActions());
  }

  function init() {
    self.loading.init = true;

    return TelephonyMediator
      .getGroup($stateParams.billingAccount)
      .then(group => group.fetchService($stateParams.serviceName).then((number) => {
        self.number = number;

        return self.number.feature.init().then(() => {
          self.actions = initActions();

          atInternet.trackPage({
            name: 'configuration',
            type: 'navigation',
            level2: 'Telecom',
            chapter1: 'telecom',
          });
        });
      })).catch((error) => {
        Toast.error([$translate.instant('telephony_alias_configuration_load_error'), _.get(error, 'data.message', '')].join(' '));
        return $q.reject(error);
      }).finally(() => {
        self.loading.init = false;
      });
  }

  /* -----  End of INITIALIZATION  ------*/

  init();
});
