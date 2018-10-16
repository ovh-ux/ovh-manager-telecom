import angular from 'angular';

import tucChartjs from './chartjs';
import tucTelecomSms from './telecom/sms';
import tucUnitHumanize from './unit/humanize';

export default angular
  .module('telecomUniverseComponents', [
    tucChartjs,
    tucTelecomSms,
    tucUnitHumanize,
  ])
  .name;
