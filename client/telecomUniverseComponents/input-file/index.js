import angular from 'angular';
import translate from 'angular-translate';
import translateAsyncLoader from '@ovh-ux/translate-async-loader';

import tucInputFileChangeDirective from './input-file-change.directive';
import tucInputFileDirective from './input-file.directive';
import './input-file.less';

const moduleName = 'tucInputFile';

angular
  .module(moduleName, [
    translate,
    translateAsyncLoader,
  ])
  .directive('tucInputFileChange', tucInputFileChangeDirective)
  .directive('tucInputFile', tucInputFileDirective)
  .run(/* @ngInject */($translate, asyncLoader) => {
    asyncLoader.addTranslations(
      import(`./translations/Messages_${$translate.use()}.xml`)
        .catch(() => import(`./translations/Messages_${$translate.fallbackLanguage()}.xml`))
        .then(x => x.default),
    );
    $translate.refresh();
  });

export default moduleName;
