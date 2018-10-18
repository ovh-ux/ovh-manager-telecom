import angular from 'angular';

import tucChartjs from './chartjs';
import tucIpAddress from './ipAddress';
import tucTelecomFax from './telecom/fax';
import tucUnitHumanize from './unit/humanize';

export default angular
  .module('telecomUniverseComponents', [
    tucChartjs,
    tucIpAddress,
    tucTelecomFax,
    tucUnitHumanize,
  ])
  .name;
