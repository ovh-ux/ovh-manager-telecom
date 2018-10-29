import angular from 'angular';

import tucTelecomTelephonyAbbreviatedNumbers from './abbreviatedNumbers';
import tucTelecomTelephonyAccessories from './accessories';
import tucTelecomTelephonyNumberPlans from './number-plans';
import tucTelecomTelephonyPhonebookcontact from './phonebookcontact';

const moduleName = 'tucTelecomTelephony';

angular
  .module(moduleName, [
    tucTelecomTelephonyAbbreviatedNumbers,
    tucTelecomTelephonyAccessories,
    tucTelecomTelephonyNumberPlans,
    tucTelecomTelephonyPhonebookcontact,
  ]);

export default moduleName;
