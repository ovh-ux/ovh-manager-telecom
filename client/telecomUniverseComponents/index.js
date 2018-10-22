import angular from 'angular';

import tucChartjs from './chartjs';
import tucDebounce from './debounce';
import tucGauge from './gauge';
import tucIpAddress from './ipAddress';
import tucSlider from './slider';
import tucSuccessDrawingCheck from './successDrawingCheck';
import tucTableSort from './table-sort';
import tucTelecomFax from './telecom/fax';
import tucTelecomOtb from './telecom/otb';
import tucTelecomSms from './telecom/sms';
import tucUnitHumanize from './unit/humanize';
import tucValidator from './validator';

export default angular
  .module('telecomUniverseComponents', [
    tucChartjs,
    tucDebounce,
    tucGauge,
    tucIpAddress,
    tucSlider,
    tucSuccessDrawingCheck,
    tucTableSort,
    tucTelecomFax,
    tucTelecomOtb,
    tucTelecomSms,
    tucUnitHumanize,
    tucValidator,
  ])
  .name;
