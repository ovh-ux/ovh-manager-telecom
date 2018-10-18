import angular from 'angular';
import 'ovh-api-services';

import TucFaxMediator from './fax-mediator.service';

export default angular
  .module('tucTelecomFax', [
    'ovh-api-services',
  ])
  .service('TucFaxMediator', TucFaxMediator)
  .name;
