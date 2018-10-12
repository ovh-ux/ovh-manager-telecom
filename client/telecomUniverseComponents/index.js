import angular from 'angular';

import tucChartjs from './chartjs';
import tucUnitHumanize from './unit/humanize';
import tucValidator from './validator';

export default angular
  .module('telecomUniverseComponents', [
    tucChartjs,
    tucUnitHumanize,
    tucValidator,
  ])
  .name;
