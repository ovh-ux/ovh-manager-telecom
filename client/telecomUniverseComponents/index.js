import angular from 'angular';

import tucChartjs from './chartjs';
import tucDebounce from './debounce';
import tucTelecomFax from './telecom/fax';
import tucUnitHumanize from './unit/humanize';

export default angular
  .module('telecomUniverseComponents', [
    tucChartjs,
    tucDebounce,
    tucTelecomFax,
    tucUnitHumanize,
  ])
  .name;
