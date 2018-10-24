import angular from 'angular';

import TucIpAddress from './ip-address.service';

export default angular
  .module('tucIpAddress', [])
  .service('TucIpAddress', TucIpAddress)
  .name;
