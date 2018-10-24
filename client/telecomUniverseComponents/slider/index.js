import angular from 'angular';

import tucSliderDirective from './slider.directive';

import './slider.less';

export default angular
  .module('tucSlider', [])
  .directive('tucSlider', tucSliderDirective)
  .name;
