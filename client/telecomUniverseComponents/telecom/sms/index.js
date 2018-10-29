import angular from 'angular';

import 'ovh-api-services';

import { TUC_SMS_REGEX, TUC_SMS_STOP_CLAUSE } from './sms.constants';
import TucSmsService from './sms-service.factory';
import TucCSVParser from './csv-parser/csv-parser.service';
import TucSmsMediator from './sms-mediator.service';

const moduleName = 'tucTelecomSms';

angular
  .module(moduleName, [
    'ovh-api-services',
  ])
  .constant('TUC_SMS_REGEX', TUC_SMS_REGEX)
  .constant('TUC_SMS_STOP_CLAUSE', TUC_SMS_STOP_CLAUSE)
  .factory('TucSmsService', TucSmsService)
  .service('TucCSVParser', TucCSVParser)
  .service('TucSmsMediator', TucSmsMediator);

export default moduleName;
