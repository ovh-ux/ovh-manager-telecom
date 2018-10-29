import angular from 'angular';
import translate from 'angular-translate';

import TucToast from '../toaster';
import TucToastError from './toast-error.service';

const moduleName = 'tucToastError';

angular
  .module(moduleName, [
    translate,
    TucToast,
  ])
  .service('TucToastError', TucToastError);

export default moduleName;
