import './pack-xdsl-access-comfort-exchange.css';
import template from './pack-xdsl-access-comfort-exchange.html';

angular.module('managerApp').component('xdslAccessComfortExchange', {
  template,
  controller: 'XdslAccessComfortExchangeCtrl',
  bindings: {
    xdslId: '<',
  },
});
