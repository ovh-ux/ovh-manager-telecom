import angular from 'angular';

import 'ovh-angular-swimming-poll';

import tucVoipServiceTask from './telecom-telephony-service-task.service';

const moduleName = 'tucTelecomTelephonyService';

angular
  .module(moduleName, [
    'ovh-angular-swimming-poll',
  ])
  .service('tucVoipServiceTask', tucVoipServiceTask);

export default moduleName;
