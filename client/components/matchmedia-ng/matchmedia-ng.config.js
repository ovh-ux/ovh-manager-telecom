angular.module("managerApp").config(function (matchmediaProvider) {
    "use strict";

    // set rules the same as less vars
    matchmediaProvider.rules.phone = "(max-width: 992px)";
    matchmediaProvider.rules.tablet = "(min-width: 993px) and (max-width: 1280px)";
    matchmediaProvider.rules.desktop = "(min-width: 1280px)";
});
