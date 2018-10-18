import angular from 'angular';

import tucChartjs from './chartjs';
import tucDebounce from './debounce';
import tucTableSort from './table-sort';
import tucTelecomFax from './telecom/fax';
import tucTelecomOtb from './telecom/otb';
import tucUnitHumanize from './unit/humanize';
import tucValidator from './validator';

export default angular
  .module('telecomUniverseComponents', [
    tucChartjs,
    tucDebounce,
    tucTableSort,
    tucTelecomFax,
    tucTelecomOtb,
    tucUnitHumanize,
    tucValidator,
  ])
  .name;
