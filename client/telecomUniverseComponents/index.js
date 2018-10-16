import angular from 'angular';

import tucChartjs from './chartjs';
import tucTelecomFax from './telecom/fax';
import tucUnitHumanize from './unit/humanize';

export default angular
  .module('telecomUniverseComponents', [
    tucChartjs,
    tucTelecomFax,
    tucUnitHumanize,
  ])
  .name;
