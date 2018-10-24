import angular from 'angular';

import tucInputFileChangeDirective from './input-file-change.directive';
import tucInputFileDirective from './input-file.directive';
import './input-file.less';

export default angular
  .module('tucInputFile', [])
  .directive('tucInputFileChange', tucInputFileChangeDirective)
  .directive('tucInputFile', tucInputFileDirective)
  .name;
