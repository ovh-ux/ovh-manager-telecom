import angular from 'angular';
import 'angular-ui-bootstrap';

import tucColSort from './colSort.component';
import tucTableSortDirective from './table-sort.directive';

export default angular
  .module('tucTableSort', [
    'ui.bootstrap',
  ])
  .component('tucColSort', tucColSort)
  .directive('tucTableSort', tucTableSortDirective)
  .name;
