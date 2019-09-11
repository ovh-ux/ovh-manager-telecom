import controller from './pack-xdsl-access-comfort-exchange.controller';
import template from './pack-xdsl-access-comfort-exchange.html';

angular.module('managerApp').component('xdslAccessComfortExchange', {
  template,
  controller,
  bindings: {
    xdslId: '<',
  },
});
