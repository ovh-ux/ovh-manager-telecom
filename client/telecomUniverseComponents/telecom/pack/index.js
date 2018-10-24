import angular from 'angular';
import 'ovh-angular-swimming-poll';
import 'ovh-api-services';

import TucPackMediator from './pack-mediator.service';
import TucPackMigrationProcess from './migration/pack-migration-process.service';
import TucPackXdslModemMediator from './xdsl/modem/pack-xdsl-modem-mediator.service';

export default angular
  .module('tucTelecomPack', [
    'ovh-angular-swimming-poll',
    'ovh-api-services',
  ])
  .service('TucPackMediator', TucPackMediator)
  .service('TucPackMigrationProcess', TucPackMigrationProcess)
  .service('TucPackXdslModemMediator', TucPackXdslModemMediator)
  .name;
