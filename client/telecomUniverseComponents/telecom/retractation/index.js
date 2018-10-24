import angular from 'angular';
import translate from 'angular-translate';
import translateAsyncLoader from '@ovh-ux/translate-async-loader';
import tucTelecomRetractation from './telecom-retractation.component';

const moduleName = 'tucTelecomRetractation';

angular
  .module(moduleName, [
    translate,
    translateAsyncLoader,
  ])
  .component('tucTelecomRetractation', tucTelecomRetractation)
  .run(/* @ngInject */ ($translate, asyncLoader) => {
    asyncLoader.addTranslations(
      import(`./translations/Messages_${$translate.use()}.xml`)
        .catch(() => import(`./translations/Messages_${$translate.fallbackLanguage()}.xml`))
        .then(x => x.default),
    );
    $translate.refresh();
  });

export default moduleName;
