import angular from 'angular';
import 'ovh-api-services';

import tucPhoneNumberDirective from './number/phone-number.directive';
import tucPhoneNumberFilter from './number/phone-number.filter';

export default angular
  .module('tucPhone', [
    'ovh-api-services',
  ])
  .directive('tucPhoneNumber', tucPhoneNumberDirective)
  .filter('tucPhoneNumber', tucPhoneNumberFilter)
  .name;
