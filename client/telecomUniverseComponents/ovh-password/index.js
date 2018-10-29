import angular from 'angular';
import translate from 'angular-translate';
import translateAsyncLoader from '@ovh-ux/translate-async-loader';

import 'angular-validation-match';
import 'ovh-ngstrap';

import tucOvhPasswordDirective from './ovh-password';
import tucOvhPasswordStrengthBarDirective from './strength/bar/ovh-password-strength-bar';
import tucOvhPasswordStrengthCheckDirective from './strength/check/ovh-password-strength-check';

import './ovh-password.less';

const moduleName = 'tucOvhPassword';

angular
  .module(moduleName, [
    'ovh-ngStrap',
    translate,
    translateAsyncLoader,
    'validation.match',
  ])
  .directive('tucOvhPassword', tucOvhPasswordDirective)
  .directive('tucOvhPasswordStrengthBar', tucOvhPasswordStrengthBarDirective)
  .directive('tucOvhPasswordStrengthCheck', tucOvhPasswordStrengthCheckDirective)
  .config(/* @ngInject */($ovhpopoverProvider) => {
    angular.extend($ovhpopoverProvider.defaults, {
      animation: 'flat-fade',
    });
  })
  .run(/* @ngInject */($translate, asyncLoader) => {
    asyncLoader.addTranslations(
      import(`./translations/Messages_${$translate.use()}.xml`)
        .catch(() => import(`./translations/Messages_${$translate.fallbackLanguage()}.xml`))
        .then(x => x.default),
    );
    $translate.refresh();
  });

export default moduleName;
