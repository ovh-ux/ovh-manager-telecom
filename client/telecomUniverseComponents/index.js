import angular from 'angular';

import tucChartjs from './chartjs';
import tucTelecomOtb from './telecom/otb';
import tucUnitHumanize from './unit/humanize';

export default angular
  .module('telecomUniverseComponents', [
    tucChartjs,
    tucTelecomOtb,
    tucUnitHumanize,
  ])
  .name;
