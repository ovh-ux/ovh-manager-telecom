import angular from 'angular';

import tucDebounce from './debounce.factory';

export default angular
  .module('tucDebounce', [])
  .factory('tucDebounce', tucDebounce)
  .name;
