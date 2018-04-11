angular.module("managerApp").service("PackMediator", function ($q, OvhApiPackXdsl, OvhApiXdsl) {
    "use strict";

    var self = this;

    self.fetchLinesByIds = function (ids) {
        if (!angular.isArray(ids) || ids.length === 0) {
            return $q.when([]);
        }

        // chunkify to avoids "request too large" error
        return $q.all(_.map(_.chunk(ids, 200), function (chunkIds) {
            return OvhApiXdsl.Lines().v7().query().batch("serviceName", [""].concat(chunkIds), ",").expand().execute().$promise;
        })).then(function (chunkResult) {
            return _.flatten(chunkResult);
        }).then(function (result) {
            return _.flatten(result);
        });
    };

    self.fetchPackAccessByIds = function (ids) {
        if (!angular.isArray(ids) || ids.length === 0) {
            return $q.when([]);
        }

        // chunkify to avoids "request too large" error
        return $q.all(_.map(_.chunk(ids, 200), function (chunkIds) {
            return OvhApiPackXdsl.v7().access().batch("packName", [""].concat(chunkIds), ",").execute().$promise;
        })).then(function (chunkResult) {
            return _.flatten(chunkResult);
        }).then(function (result) {
            return _.flatten(result);
        });
    };

    self.fetchXdslByIds = function (ids) {
        if (!angular.isArray(ids) || ids.length === 0) {
            return $q.when([]);
        }

        // chunkify to avoids "request too large" error
        return $q.all(_.map(_.chunk(ids, 200), function (chunkIds) {
            return OvhApiXdsl.v7().query().batch("serviceName", [""].concat(chunkIds), ",").expand().execute().$promise;
        })).then(function (chunkResult) {
            return _.flatten(chunkResult);
        }).then(function (result) {
            return _.flatten(result);
        });
    };

    self.fetchXdslByNumber = function () {
        return OvhApiXdsl.Lines().v7().get().aggregate("serviceName").execute().$promise.then(function (result) {
            return self.fetchXdslByIds(_.map(result, function (item) {
                if (item && item.path) {
                    var match = /\/xdsl\/([^\/]+)/.exec(item.path);
                    return match && match.length >= 2 ? match[1] : null;
                }
                return null;
            }));
        });
    };

    self.fetchPacks = function () {
        var request = OvhApiPackXdsl.v7().query().sort(["description", "offerDescription", "packName"]);
        var packList = [];
        return request.expand().execute().$promise.then(function (result) {
            packList = _.pluck(result, "value");
            angular.forEach(packList, function (pack) {
                pack.xdsl = [];
            });
        }).then(function () {
            // fetch xdsl ids of each pack
            return self.fetchPackAccessByIds(_.pluck(packList, "packName")).then(function (result) {
                angular.forEach(result, function (access) {
                    if (access.path && angular.isArray(access.value)) {
                        var match = /\/pack\/xdsl\/([^\/]+)/.exec(access.path);
                        var packId = match && match.length === 2 ? match[1] : null;
                        var pack = _.find(packList, { packName: packId });
                        if (pack) {
                            pack.xdsl = pack.xdsl.concat(_.map(access.value, function (id) {
                                return { accessName: id };
                            }));
                        }
                    }
                });
            });
        }).then(function () {
            // fetch xdsl details of each xdsl
            var xdslIds = _.pluck(_.flatten(_.pluck(packList, "xdsl")), "accessName");
            return self.fetchXdslByIds(xdslIds).then(function (result) {
                angular.forEach(result, function (xdsl) {
                    angular.forEach(packList, function (pack) {
                        var found = _.find(pack.xdsl, { accessName: xdsl.key });
                        if (found) {
                            _.assign(found, xdsl.value);
                        }
                    });
                });
            });
        }).then(function () {
            // fetch line of each xdsl
            var xdslIds = _.pluck(_.flatten(_.pluck(packList, "xdsl")), "accessName");
            return self.fetchLinesByIds(xdslIds).then(function (lines) {
                angular.forEach(lines, function (result) {
                    if (result.path) {
                        var match = /\/xdsl\/([^\/]+)/.exec(result.path);
                        var xdslId = match && match.length === 2 ? match[1] : null;
                        angular.forEach(packList, function (pack) {
                            var found = _.find(pack.xdsl, { accessName: xdslId });
                            if (found) {
                                found.line = result.value;
                            }
                        });
                    }
                });
            });
        }).then(function () {
            return packList;
        });
    };

    self.fetchXdsl = function (xdslType) {
        var request = OvhApiXdsl.v7().query().addFilter("accessType", "eq", xdslType).sort(["description", "accessName"]);
        var xdslList = [];
        return request.expand().execute().$promise.then(function (result) {
            xdslList = xdslList.concat(_.pluck(result, "value"));
        }).then(function () {
            angular.forEach(xdslList, function (sdsl) {
                sdsl.lines = [];
            });
            return self.fetchLinesByIds(_.pluck(xdslList, "accessName")).then(function (lines) {
                angular.forEach(lines, function (result) {
                    if (result.path) {
                        var match = /\/xdsl\/([^\/]+)/.exec(result.path);
                        var sdslId = match && match.length === 2 ? match[1] : null;
                        var sdsl = _.find(xdslList, { accessName: sdslId });
                        if (sdsl) {
                            sdsl.lines.push(result.value);
                        }
                    }
                });
                return xdslList;
            });
        });
    };

    self.getPackStatus = function (packId) {
        return OvhApiPackXdsl.v6().getServiceInfos(
            {
                packId: packId
            }
        ).$promise.then(function (info) {
            return info.status;
        }).catch(function () {
            return "error";
        });
    };

    /*= ======================================
    =            SIDEBAR HELPERS            =
    =======================================*/

    self.getCount = function () {
        return $q.all({
            pack: OvhApiPackXdsl.v7().query().execute().$promise,
            xdsl: OvhApiXdsl.v7().query().addFilter("status", "ne", "deleting").execute().$promise
        }).then(function (result) {
            return result.pack.length + result.xdsl.length;
        });
    };

});
