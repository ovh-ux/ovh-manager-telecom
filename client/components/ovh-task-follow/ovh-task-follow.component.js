angular.module('managerApp').run(($translate, asyncLoader) => {
  asyncLoader.addTranslations(
    import(`./translations/Messages_${$translate.use()}.xml`)
      .catch(() => import(`./translations/Messages_${$translate.fallbackLanguage()}.xml`))
      .then(x => x.default),
  );
  $translate.refresh();
});
angular.module('managerApp').component('ovhTaskFollow', {
  templateUrl: 'components/ovh-task-follow/ovh-task-follow.html',
  controller: 'ovhTaskFollowCtrl',
});
