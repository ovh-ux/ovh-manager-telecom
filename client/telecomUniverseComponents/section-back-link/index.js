import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import tucSectionBackLink from './section-back-link.component';

const moduleName = 'tucSectionBackLink';

angular
  .module(moduleName, [
    uiRouter,
  ])
  .component('tucSectionBackLink', tucSectionBackLink);

export default moduleName;
