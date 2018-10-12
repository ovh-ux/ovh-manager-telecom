import angular from 'angular';

import tucUnitHumanize from './unit/humanize';

export default angular
  .module('telecomUniverseComponents', [
    tucUnitHumanize,
  ])
  .name;
