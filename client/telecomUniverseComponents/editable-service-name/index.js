import angular from 'angular';
import translate from 'angular-translate';

import tucEditableServiceNameCtrl from './editable-service-name.controller';
import tucEditableServiceNameDirective from './editable-service-name.directive';
import './editable-service-name.less';

export default angular
  .module('tucEditableServiceName', [
    translate,
  ])
  .controller('tucEditableServiceNameCtrl', tucEditableServiceNameCtrl)
  .directive('tucEditableServiceName', tucEditableServiceNameDirective)
  .name;
