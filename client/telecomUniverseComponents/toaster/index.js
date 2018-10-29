import angular from 'angular';
import translate from 'angular-translate';
import translateAsyncLoader from '@ovh-ux/translate-async-loader';

import tucToastMessage from './toast-message.component';
import tucToastMessageScrollerDirective from './toast-message-scroller.directive';
import TucToast from './toast.service';

const moduleName = 'tucToaster';

angular
  .module(moduleName, [
    translate,
    translateAsyncLoader,
  ])
  .component('tucToastMessage', tucToastMessage)
  .directive('tucToastMessageScroller', tucToastMessageScrollerDirective)
  .service('TucToast', TucToast)
  .run(/* @ngInject */($translate, asyncLoader) => {
    asyncLoader.addTranslations(
      import(`./translations/Messages_${$translate.use()}.xml`)
        .catch(() => import(`./translations/Messages_${$translate.fallbackLanguage()}.xml`))
        .then(x => x.default),
    );
    $translate.refresh();
  });

export default moduleName;
