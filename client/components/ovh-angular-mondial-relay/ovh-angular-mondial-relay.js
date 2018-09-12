
angular.module('managerApp').run(($translate, asyncLoader) => {
  asyncLoader.addTranslations(import(`ovh-angular-mondial-relay/src/ovh-angular-mondial-relay/translations/Messages_${$translate.use()}.xml`).then(x => x.default));
  $translate.refresh();
});
