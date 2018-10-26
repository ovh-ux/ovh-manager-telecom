import angular from 'angular';

import tucTelecomTelephonyAccessories from './accessories';

const moduleName = 'tucTelecomTelephony';

angular
  .module(moduleName, [
    tucTelecomTelephonyAccessories,
  ]);

export default moduleName;
