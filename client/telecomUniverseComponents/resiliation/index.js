import angular from 'angular';
import translate from 'angular-translate';
import translateAsyncLoader from '@ovh-ux/translate-async-loader';
import 'angular-ui-bootstrap';

import tucResiliationReason from './resiliation-reason.component';

const moduleName = 'tucResiliation';

angular
  .module(moduleName, [
    translate,
    translateAsyncLoader,
    'ui.bootstrap',
  ])
  .component('tucResiliationReason', tucResiliationReason)
  .run(/* @ngInject */($translate, asyncLoader) => {
    asyncLoader.addTranslations(
      import(`./translations/Messages_${$translate.use()}.xml`)
        .catch(() => import(`./translations/Messages_${$translate.fallbackLanguage()}.xml`))
        .then(x => x.default),
    );
    $translate.refresh();
  });

export default moduleName;
