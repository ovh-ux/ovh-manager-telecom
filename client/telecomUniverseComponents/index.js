import angular from 'angular';

import tucChartjs from './chartjs';
import tucDebounce from './debounce';
import tucEditableServiceName from './editable-service-name';
import tucElapsedTime from './elapsed-time';
import tucFileReader from './file-reader';
import tucFilters from './filters';
import tucGauge from './gauge';
import tucHideOutsideClick from './hideOutsideClick';
import tucInputFile from './input-file';
import tucInputFilter from './input-filter';
import tucIpAddress from './ipAddress';
import tucJsplumb from './jsplumb';
import tucPhone from './phone';
import tucSectionBackLink from './section-back-link';
import tucSlider from './slider';
import tucSuccessDrawingCheck from './successDrawingCheck';
import tucTableSort from './table-sort';
import tucTelecomFax from './telecom/fax';
import tucTelecomOtb from './telecom/otb';
import tucTelecomPack from './telecom/pack';
import tucTelecomSms from './telecom/sms';
import tucTelecomTelephony from './telecom/telephony';
import tucTelecomV4Links from './telecom/v4-links';
import tucToaster from './toaster';
import tucToastError from './toast-error';
import tucUiSortableHelpers from './uiSortableHelpers';
import tucUnitHumanize from './unit/humanize';
import tucValidator from './validator';

export default angular
  .module('telecomUniverseComponents', [
    tucChartjs,
    tucDebounce,
    tucEditableServiceName,
    tucElapsedTime,
    tucFileReader,
    tucFilters,
    tucGauge,
    tucHideOutsideClick,
    tucInputFile,
    tucInputFilter,
    tucIpAddress,
    tucJsplumb,
    tucPhone,
    tucSectionBackLink,
    tucSlider,
    tucSuccessDrawingCheck,
    tucTableSort,
    tucTelecomFax,
    tucTelecomOtb,
    tucTelecomPack,
    tucTelecomSms,
    tucTelecomTelephony,
    tucTelecomV4Links,
    tucToaster,
    tucToastError,
    tucUiSortableHelpers
    tucUnitHumanize,
    tucValidator,
  ])
  .name;
