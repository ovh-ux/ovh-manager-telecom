import angular from 'angular';

import tucToastMessage from './toast-message.component';
import tucToastMessageScrollerDirective from './toast-message-scroller.directive';
import TucToast from './toast.service';

const moduleName = 'tucToaster';

angular
  .module(moduleName, [])
  .component('tucToastMessage', tucToastMessage)
  .directive('tucToastMessageScroller', tucToastMessageScrollerDirective)
  .service('TucToast', TucToast);

export default moduleName;
