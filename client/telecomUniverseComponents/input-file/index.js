import angular from 'angular';

import tucInputFileChangeDirective from './input-file-change.directive';
import tucInputFileDirective from './input-file.directive';
import './input-file.less';

const moduleName = 'tucInputFile';

angular
  .module(moduleName, [])
  .directive('tucInputFileChange', tucInputFileChangeDirective)
  .directive('tucInputFile', tucInputFileDirective);

export default moduleName;
