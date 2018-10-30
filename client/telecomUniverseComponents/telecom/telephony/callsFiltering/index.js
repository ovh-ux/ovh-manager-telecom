import angular from 'angular';
import translate from 'angular-translate';
import translateAsyncLoader from '@ovh-ux/translate-async-loader';
import uiRouter from '@uirouter/angularjs';

import tucCsvParser from '../../../csv-parser';
import tucFileReader from '../../../file-reader';
import tucPhone from '../../../phone';
import tucToaster from '../../../toaster';
import tucToastError from '../../../toast-error';

import 'angular-ui-bootstrap';
import 'ng-csv';
import 'ovh-ui-angular';

import tucTelecomTelephonyCallsFilteringAddHelperCtrl from './addHelper/telecom-telephony-callsFilteringAddHelper.controller';
import tucTelecomTelephonyCallsFilteringAdd from './telecom-telephony-callsFilteringAdd.component';
import tucTelecomTelephonyCallsFilteringTable from './telecom-telephony-callsFilteringTable.component';

const moduleName = 'tucTelecomTelephonyCallsFiltering';

angular
  .module(moduleName, [
    'ngCsv',
    'oui',
    translate,
    translateAsyncLoader,
    tucCsvParser,
    tucFileReader,
    tucPhone,
    tucToaster,
    tucToastError,
    'ui.bootstrap',
    uiRouter,
  ])
  .controller('tucTelecomTelephonyCallsFilteringAddHelperCtrl', tucTelecomTelephonyCallsFilteringAddHelperCtrl)
  .component('tucTelecomTelephonyCallsFilteringAdd', tucTelecomTelephonyCallsFilteringAdd)
  .component('tucTelecomTelephonyCallsFilteringTable', tucTelecomTelephonyCallsFilteringTable)
  .run(/* @ngInject */($translate, asyncLoader) => {
    asyncLoader.addTranslations(
      import(`./translations/Messages_${$translate.use()}.xml`)
        .catch(() => import(`./translations/Messages_${$translate.fallbackLanguage()}.xml`))
        .then(x => x.default),
    );
    $translate.refresh();
  });

export default moduleName;
