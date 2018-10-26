import angular from 'angular';

import tucTelecomTelephonyAccessories from './accessories';
import tucTelecomTelephonyPhonebookcontact from './phonebookcontact';

const moduleName = 'tucTelecomTelephony';

angular
  .module(moduleName, [
    tucTelecomTelephonyAccessories,
    tucTelecomTelephonyPhonebookcontact,
  ]);

export default moduleName;
