import angular from 'angular';

import tucChartjs from './chartjs';
import tucUnitHumanize from './unit/humanize';

export default angular
  .module('telecomUniverseComponents', [
    tucChartjs,
    tucUnitHumanize,
  ])
  .name;
