import angular from 'angular';

import tucChartjs from './chartjs';
import tucDebounce from './debounce';
import tucUnitHumanize from './unit/humanize';

export default angular
  .module('telecomUniverseComponents', [
    tucChartjs,
    tucDebounce,
    tucUnitHumanize,
  ])
  .name;
