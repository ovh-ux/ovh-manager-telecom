import angular from 'angular';
import translate from 'angular-translate';

import TucToast from '../toaster';
import TucToastError from './toast-error.service';

export default angular
  .module('tucToastError', [
    translate,
    TucToast,
  ])
  .service('TucToastError', TucToastError)
  .name;
