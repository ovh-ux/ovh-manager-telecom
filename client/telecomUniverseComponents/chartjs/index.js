import angular from 'angular';

import { CHARTJS } from './chartjs.constants';
import tucChartjsDirective from './chartjs.directive';
import tucChartjsFactory from './chartjs.factory';

export default angular
  .module('tucChartjs', [])
  .constant('TUC_CHARTS', CHARTJS)
  .directive('tucChartjs', tucChartjsDirective)
  .factory('TucChartjsFactory', tucChartjsFactory)
  .name;
