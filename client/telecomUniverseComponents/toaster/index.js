import angular from 'angular';

import tucToastMessage from './toast-message.component';
import tucToastMessageScrollerDirective from './toast-message-scroller.directive';
import TucToast from './toast.service';

export default angular
  .module('tucToaster', [])
  .component('tucToastMessage', tucToastMessage)
  .directive('tucToastMessageScroller', tucToastMessageScrollerDirective)
  .service('TucToast', TucToast)
  .name;
