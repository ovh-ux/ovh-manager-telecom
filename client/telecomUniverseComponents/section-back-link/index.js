import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import tucSectionBackLink from './section-back-link.component';

export default angular
  .module('tucSectionBackLink', [
    uiRouter,
  ])
  .component('tucSectionBackLink', tucSectionBackLink)
  .name;
