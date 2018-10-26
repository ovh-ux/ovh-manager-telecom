import angular from 'angular';

import tucTelecomTelephonyAccessories from './accessories';
import tucTelecomTelephonyNumberPlans from './number-plans';
import tucTelecomTelephonyPhonebookcontact from './phonebookcontact';

const moduleName = 'tucTelecomTelephony';

angular
  .module(moduleName, [
    tucTelecomTelephonyAccessories,
    tucTelecomTelephonyNumberPlans,
    tucTelecomTelephonyPhonebookcontact,
  ]);

export default moduleName;
