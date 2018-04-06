/**
 * Main application routes
 */
"use strict";
const path = require("path");
const proxy = require("request");
const config = require("./config/environment");
const errors = require("./components/errors");
const cookie = require("cookie");
const base64url = require("base64url");

module.exports = function (app) {

    // [SSO] authentication
    app.route(/^\/cgi-bin\/crosslogin.cgi/).get(function (req, res) {
        var headers = req.headers;
        headers.host = "www.ovh.com";

        proxy.get({
            url: "https://www.ovh.com" + req.url,
            headers: headers,
            followRedirect: false
        }, function (err, resp, data) {
            if (err) {
                return res.status(500);
            }

            var cookies = resp.headers["set-cookie"];
            var parsedCookie;

            for (var i = cookies.length - 1; i >= 0; i--) {
                parsedCookie = cookie.parse(cookies[i]);

                if (parsedCookie.SESSION) {
                    res.cookie("SESSION", parsedCookie.SESSION, { path: "/", httpOnly: true });
                }
                if (parsedCookie.USERID) {
                    res.cookie("USERID", parsedCookie.USERID, { path: "/" });
                }
            }

            return res.redirect("/");
        });
    });

    app.route("/auth").get((req, res) => {
        let origin = req.headers.host;
        const headers = {
            contentType: "application/json"
        };
        headers.host = "www.ovh.com";

        proxy.post({
            url: "https://www.ovh.com/auth/requestDevLogin/",
            headers: headers,
            followRedirect: false,
            gzip: true,
            json: {
                callbackUrl: `https://${origin}/auth-check`
            }
        }, (err, resp, data) => {
            if (err) {
                return res.status(500);
            }

            return res.redirect(data.data.url);
        });
    });

    app.route("/auth-check").get((req, res) => {
        var headers = req.headers;
        headers.host = "www.ovh.com";

        let cookies = [];

        try {
            cookies = JSON.parse(base64url.decode(req.query.data));

            if (Array.isArray(cookies.cookies)) {
                cookies.cookies.forEach((c) => {

                    let parsedCookie = cookie.parse(c);

                    if (parsedCookie.SESSION) {
                        res.cookie("SESSION", parsedCookie.SESSION, { path: "/", httpOnly: true });
                    }
                    if (parsedCookie.USERID) {
                        res.cookie("USERID", parsedCookie.USERID, { path: "/" });
                    }
                });
            }
        } catch (err) {
            console.error(err);
        }

        res.redirect("/");
    });

    // APIv6
    app.route(/^\/(?:engine\/)?apiv6/).all(function (req, res) {
        var headers = req.headers;
        headers["Referer"] =  "www.ovhtelecom.fr";
        headers["host"] =  "www.ovhtelecom.fr";
        headers["referer"] = "www.ovhtelecom.fr";
        req.headers["Referer"] =  "www.ovhtelecom.fr";
        req.headers["Host"] =  "www.ovhtelecom.fr";
        req.headers["referer"] =  "www.ovhtelecom.fr";

        var p = proxy[req.method.toLowerCase() || "get"]({
            url: config.api.url + req.url.replace(/^\/(?:engine\/)?apiv6/, ""),
            headers: headers
        }, function (error, response) {
            if (response) {
                console.log("[APIV6]", error, response.statusCode, response.request.path);
            }
        });
        p.on("error", function (err) {
            res.status(500).json(err);
        });
        req.pipe(p).pipe(res);
    });

    // APIv7
    app.route(/^\/(?:engine\/)?apiv7/).all(function (req, res) {
        var headers = req.headers;
        headers["Referer"] =  "www.ovhtelecom.fr";
        headers["host"] =  "www.ovhtelecom.fr";
        headers["referer"] = "www.ovhtelecom.fr";
        req.headers["Referer"] =  "www.ovhtelecom.fr";
        req.headers["Host"] =  "www.ovhtelecom.fr";
        req.headers["referer"] =  "www.ovhtelecom.fr";

        var p = proxy[req.method.toLowerCase() || "get"]({
            url: config.apiv7.url + req.url.replace(/^\/(?:engine\/)?apiv7/, ""),
            headers: headers
        }, function (error, response) {
            if (response) {
                console.log("[APIV7]", error, response.statusCode, response.request.path);
            }
        });
        p.on("error", function (err) {
            res.status(500).json(err);
        });
        req.pipe(p).pipe(res);
    });

    // 2API
    app.route(/^\/(?:engine\/)?2api/).all(function (req, res) {
        var headers = req.headers;
        headers["Referer"] =  "www.ovhtelecom.fr";
        headers["host"] =  "www.ovhtelecom.fr";
        headers["referer"] = "www.ovhtelecom.fr";
        req.headers["Referer"] =  "www.ovhtelecom.fr";
        req.headers["Host"] =  "www.ovhtelecom.fr";
        req.headers["referer"] =  "www.ovhtelecom.fr";

        var p = proxy[req.method.toLowerCase() || "get"]({
            url: config.aapi.url + req.url.replace(/^\/(?:engine\/)?2api/, ""),
            headers: headers
        }, function (error, response) {
            if (response) {
                console.log("[2API]", error, response.statusCode, response.request.path);
            }
        });
        p.on("error", function (err) {
            res.status(500).json(err);
        });
        req.pipe(p).pipe(res);
    });

    // WS
    app.route(/^\/ws/).all(function (req, res) {
        var headers = req.headers;
        headers["Referer"] =  "www.ovhtelecom.fr";
        headers["host"] =  "www.ovhtelecom.fr";
        headers["referer"] = "www.ovhtelecom.fr";
        req.headers["Referer"] =  "www.ovhtelecom.fr";
        req.headers["Host"] =  "www.ovhtelecom.fr";
        req.headers["referer"] =  "www.ovhtelecom.fr";

        var p = proxy[req.method.toLowerCase() || "get"]({
            url: config.ws.url + req.url.replace(/^\/ws/, ""),
            headers: headers
        }, function (error, response) {
            if (response) {
                console.log("[WS]", error, response.statusCode, response.request.path);
            }
        });
        p.on("error", function (err) {
            res.status(500).json(err);
        });
        req.pipe(p).pipe(res);
    });

    // The prod login page route should be redirect to the development login page
    app.route("/login/").get(function (req, res) {
        res.redirect(301, "/auth.html");
    });

    // All undefined asset or api routes should return a 404
    app.route("/:url(auth|components|app|bower_components|node_modules|assets|fonts)/*").get(function (req, res) {
        if (
            (
                req.path.match(/Messages_.._..\.json$/) ||
                req.path.match(/app\.css$/) ||
                req.path.match(/app-scss\.css$/)
            ) && req.path.indexOf("bower_components") === -1
            && req.path.indexOf("node_modules") === -1
        ) {
            res.sendFile(path.join(path.normalize(__dirname + "/../.tmp"), req.path));
        } else if (req.path.indexOf("bower_components") >= 0) {
            res.sendFile(path.join(path.normalize(__dirname + "/../client"), req.path));
        } else if (req.path.indexOf("node_modules") >= 0) {
            res.sendFile(path.join(path.normalize(__dirname + "/.."), req.path));
        } else {
            res.sendFile(path.join(path.normalize(__dirname + "/../dist/client"), req.path));
        }
    }).get(errors[404]);

    // All other routes should redirect to the index.html
    app.route("/*").get(function (req, res) {
        res.sendFile(path.resolve(app.get("appPath") + "/index.html"));
    });
};
