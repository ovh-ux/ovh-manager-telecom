import angular from 'angular';

import tucTelecomTelephonyAbbreviatedNumbers from './abbreviatedNumbers';
import tucTelecomTelephonyAccessories from './accessories';
import tucTelecomTelephonyCallsFiltering from './callsFiltering';
import tucTelecomTelephonyNumberPlans from './number-plans';
import tucTelecomTelephonyPhonebookcontact from './phonebookcontact';

const moduleName = 'tucTelecomTelephony';

angular
  .module(moduleName, [
    tucTelecomTelephonyAbbreviatedNumbers,
    tucTelecomTelephonyAccessories,
    tucTelecomTelephonyCallsFiltering,
    tucTelecomTelephonyNumberPlans,
    tucTelecomTelephonyPhonebookcontact,
  ]);

export default moduleName;
