/**
 * Simple directive to restrict user input.
 *
 * Example :
 *
 *     <input input-filter="$ctrl.myFilter" />
 *
 *     $ctrl.myFilter = function (value) {
 *         return value.replace(/\w/g, "");
 *     };
 */
angular.module('managerApp').directive('inputFilter', $parse => ({
  require: 'ngModel',
  restrict: 'A',
  link(scope, elt, attrs, modelCtrl) {
    const handler = $parse(attrs.inputFilter)(scope);
    if (handler) {
      modelCtrl.$parsers.push((value) => {
        const filtered = handler(value);
        if (filtered !== value) {
          modelCtrl.$setViewValue(filtered);
          modelCtrl.$render(filtered);
        }
        return filtered;
      });
    }
  },
}));
