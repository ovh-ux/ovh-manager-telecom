angular.module("managerApp").service("SiteBuildersWS", function ($http, $q) {
    "use strict";

    this.getSiteBuilders = function () {
        return $q.all([
            $http.get("/siteBuilder/trunk/ws.dispatcher/siteBuilderListServices", {
                serviceType: "ws"
            }).then(function (dParam) {
                var d = _.get(dParam, "data");
                if (!d.answer) {
                    d.answer = [];
                }
                return $q.all(d.answer.map(function (sb) {
                    return $http.get("/siteBuilder/trunk/ws.dispatcher/siteBuilderGetInfo?params=" + JSON.stringify({ serviceName: sb.serviceName }), {
                        serviceType: "ws"
                    }).then(function (data) {
                        return _.assign({}, data.data.answer, { state: sb.state });
                    });
                }));
            }),

            $http.get("/pack/xdsl/*/subServices/*/?$aggreg=1&type:in=siteBuilderStart,siteBuilderFull", {
                serviceType: "apiv7"
            }).then(function (packsResult) {
                var packs = _.get(packsResult, "data");
                var sb = packs.map(function (p) { return p.value.domain; });
                return $q.all(sb.map(function (s) {
                    return $http.get("/siteBuilder/trunk/ws.dispatcher/siteBuilderGetInfo?params=" + JSON.stringify({ serviceName: s }), {
                        serviceType: "ws"
                    }).then(function (data) {
                        return _.assign(data.data.answer, { state: "ok" });
                    });
                }));
            })
        ]).then(function (siteBuilders) {
            return $q.all(_.flattenDeep(siteBuilders).map(function (siteBuilder) {
                return $http.get("/siteBuilder/trunk/ws.dispatcher/siteBuilderGetLogInUrl?params=" + JSON.stringify({ serviceName: siteBuilder.serviceName }), {
                    serviceType: "ws"
                }).then(function (loginResult) {
                    var login = _.get(loginResult, "data");
                    return _.assign(siteBuilder, { login: login.answer.logUrl });
                });
            }));
        });
    };
});
