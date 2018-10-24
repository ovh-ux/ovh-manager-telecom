import angular from 'angular';

import tucHideOutsideClickDirective from './hide-outside-click.directive';

export default angular
  .module('tucHideOutsideClick', [])
  .directive('tucHideOutsideClick', tucHideOutsideClickDirective)
  .name;
