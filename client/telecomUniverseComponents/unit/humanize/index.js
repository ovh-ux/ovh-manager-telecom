import angular from 'angular';
import translate from 'angular-translate';

import tucUnitHumanizeFilter from './unit-humanize.filter';

export default angular
  .module('tucUnitHumanize', [
    translate,
  ])
  .filter('tuc-unit-humanize', tucUnitHumanizeFilter)
  .name;
