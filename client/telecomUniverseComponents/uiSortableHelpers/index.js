import angular from 'angular';

import { TUC_UI_SORTABLE_HELPERS } from './uiSortableHelpersVariableHeightTolerance';

export default angular
  .module('tucUiSortableHelpers', [])
  .constant('TUC_UI_SORTABLE_HELPERS', TUC_UI_SORTABLE_HELPERS)
  .name;
