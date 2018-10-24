import angular from 'angular';

import tucInputFilterDirective from './input-filter.directive';

export default angular
  .module('tucInputFilter', [])
  .directive('tucInputFilter', tucInputFilterDirective)
  .name;
