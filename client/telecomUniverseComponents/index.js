import angular from 'angular';

import tucChartjs from './chartjs';
import tucDebounce from './debounce';
import tucEditableServiceName from './editable-service-name';
import tucElapsedTime from './elapsed-time';
import tucFileReader from './file-reader';
import tucGauge from './gauge';
import tucHideOutsideClick from './hideOutsideClick';
import tucInputFile from './input-file';
import tucIpAddress from './ipAddress';
import tucPhone from './phone';
import tucSectionBackLink from './section-back-link';
import tucSlider from './slider';
import tucSuccessDrawingCheck from './successDrawingCheck';
import tucTableSort from './table-sort';
import tucTelecomFax from './telecom/fax';
import tucTelecomOtb from './telecom/otb';
import tucTelecomSms from './telecom/sms';
import tucTelecomV4Links from './telecom/v4-links';
import tucUnitHumanize from './unit/humanize';
import tucValidator from './validator';

export default angular
  .module('telecomUniverseComponents', [
    tucChartjs,
    tucDebounce,
    tucEditableServiceName,
    tucElapsedTime,
    tucFileReader,
    tucGauge,
    tucHideOutsideClick,
    tucInputFile,
    tucIpAddress,
    tucPhone,
    tucSectionBackLink,
    tucSlider,
    tucSuccessDrawingCheck,
    tucTableSort,
    tucTelecomFax,
    tucTelecomOtb,
    tucTelecomSms,
    tucTelecomV4Links,
    tucUnitHumanize,
    tucValidator,
  ])
  .name;
