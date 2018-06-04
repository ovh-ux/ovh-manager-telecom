angular.module('managerApp').service('CSVParser', function () {
  this.setColumnSeparator = function (separatorParam) {
    let separator = separatorParam;

    if (separator === undefined) {
      separator = ';';
    }

    CSV.COLUMN_SEPARATOR = separator;
  };

  this.setDetectTypes = function (detectParam) {
    let detect = detectParam;

    if (detect === undefined) {
      detect = false;
    }

    CSV.DETECT_TYPES = detect;
  };

  this.parse = function (data) {
    return CSV.parse(data);
  };
});
