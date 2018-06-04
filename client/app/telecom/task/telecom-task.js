angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.task', {
    url: '/task',
    views: {
      'telecomView@telecom': {
        templateUrl: 'app/telecom/task/telecom-task.html',
        controller: 'TelecomTaskCtrl',
        controllerAs: 'TaskCtrl',
      },
    },
    translations: ['common', 'telecom/task'],
    resolve: {
      $title(translations, $translate) {
        return $translate('telecom_task_page_title');
      },
    },
  });
});
