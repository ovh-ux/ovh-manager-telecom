import angular from 'angular';
import 'ovh-api-services';

import TucOverTheBoxMediator from './over-the-box-mediator.service';

export default angular
  .module('tucTelecomOtb', [
    'ovh-api-services',
  ])
  .service('TucOverTheBoxMediator', TucOverTheBoxMediator)
  .name;
