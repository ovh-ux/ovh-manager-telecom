import angular from 'angular';
import translate from 'angular-translate';
import translateAsyncLoader from '@ovh-ux/translate-async-loader';

import 'angular-ui-bootstrap';
import 'ovh-ui-angular';

import tucTelephonyBulkActionModalCtrl from './modal/telephony-bulk-action-modal.controller';
import tucTelephonyBulkActionCtrl from './telephony-bulk-action.component.controller';
import tucTelephonyBulkAction from './telephony-bulk-action.component';
import tucTelephonyBulkActionUpdatedServicesContainer from './telephony-bulk-action-updated-services-container.factory';
import tucTelephonyBulk from './telephony-bulk-action.service';

import './telephony-bulk-action.less';

const moduleName = 'tucTelecomTelephonyBulkAction';

angular
  .module(moduleName, [
    'oui',
    translate,
    translateAsyncLoader,
    'ui.bootstrap',
  ])
  .controller('tucTelephonyBulkActionModalCtrl', tucTelephonyBulkActionModalCtrl)
  .controller('tucTelephonyBulkActionCtrl', tucTelephonyBulkActionCtrl)
  .component('tucTelephonyBulkAction', tucTelephonyBulkAction)
  .factory('tucTelephonyBulkActionUpdatedServicesContainer', tucTelephonyBulkActionUpdatedServicesContainer)
  .service('tucTelephonyBulk', tucTelephonyBulk)
  .run(/* @ngInject */($translate, asyncLoader) => {
    asyncLoader.addTranslations(
      import(`./translations/Messages_${$translate.use()}.xml`)
        .catch(() => import(`./translations/Messages_${$translate.fallbackLanguage()}.xml`))
        .then(x => x.default),
    );
    $translate.refresh();
  });

export default moduleName;
