import angular from 'angular';

import tucFileReaderDirective from './file-reader.directive';
import './file-reader.less';

export default angular
  .module('tucFileReader', [])
  .directive('tucFileReader', tucFileReaderDirective)
  .name;
