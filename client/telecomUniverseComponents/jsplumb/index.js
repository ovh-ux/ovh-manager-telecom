import angular from 'angular';

import { TUC_JS_PLUMB, TUC_JS_PLUMB_UTIL } from './jsPlumb.constant';
import TucJsplumbConnectionCtrl from './connection/jsplumb-connection.directive.controller';
import TucJsplumbEndpointCtrl from './endpoint/jsplumb-endpoint.directive.controller';
import TucJsplumbCtrl from './jsplumb.directive.controller';
import tucJsplumbConnectionDirective from './connection/jsplumb-connection.directive';
import tucJsplumbEndpointDirective from './endpoint/jsplumb-endpoint.directive';
import tucJsplumbDirective from './jsplumb.directive';
import tucJsplumbService from './jsplumb.service';
import registerTwoSegmentsConnector from './connector/twoSegments/jsplumb-connector-twoSegment';

export default angular
  .module('tucJsplumb', [])
  .constant('TUC_JS_PLUMB', TUC_JS_PLUMB)
  .constant('TUC_JS_PLUMB_UTIL', TUC_JS_PLUMB_UTIL)
  .controller('TucJsplumbConnectionCtrl', TucJsplumbConnectionCtrl)
  .controller('TucJsplumbEndpointCtrl', TucJsplumbEndpointCtrl)
  .controller('TucJsplumbCtrl', TucJsplumbCtrl)
  .directive('tucJsplumbConnection', tucJsplumbConnectionDirective)
  .directive('tucJsplumbEndpoint', tucJsplumbEndpointDirective)
  .directive('tucJsplumb', tucJsplumbDirective)
  .service('tucJsPlumbService', tucJsplumbService)
  .config(registerTwoSegmentsConnector)
  .name;
