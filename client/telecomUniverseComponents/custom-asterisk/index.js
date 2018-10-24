import angular from 'angular';

import tucCustomAsteriskDirective from './custom-asterisk.directive';

export default angular
  .module('tucCustomAsterisk', [])
  .directive('tucCustomAsterisk', tucCustomAsteriskDirective)
  .name;
