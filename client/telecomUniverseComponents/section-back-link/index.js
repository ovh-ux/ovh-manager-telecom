import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import translate from 'angular-translate';
import translateAsyncLoader from '@ovh-ux/translate-async-loader';

import tucSectionBackLink from './section-back-link.component';

const moduleName = 'tucSectionBackLink';

angular
  .module(moduleName, [
    translate,
    translateAsyncLoader,
    uiRouter,
  ])
  .component('tucSectionBackLink', tucSectionBackLink)
  .run(/* @ngInject */($translate, asyncLoader) => {
    asyncLoader.addTranslations(
      import(`./translations/Messages_${$translate.use()}.xml`)
        .catch(() => import(`./translations/Messages_${$translate.fallbackLanguage()}.xml`))
        .then(x => x.default),
    );
    $translate.refresh();
  });

export default moduleName;
