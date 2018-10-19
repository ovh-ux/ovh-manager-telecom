import angular from 'angular';

import tucGaugeDirective from './gauge.directive';
import './gauge.less';

export default angular
  .module('tucGauge', [])
  .directive('tucGauge', tucGaugeDirective)
  .name;
