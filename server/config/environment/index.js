"use strict";

var path = require("path");
var _ = require("lodash");

function requiredProcessEnv (name) {
    if (!process.env[name]) {
        throw new Error("You must set the " + name + " environment variable");
    }
    return process.env[name];
}

// All configurations will extend these options
// ============================================
module.exports = {
    env : process.env.NODE_ENV,

    // Root path of server
    root : path.normalize(__dirname + "/../../.."),

    // Server port
    port : process.env.PORT || 8080,

    api  : {
        // url: 'https://www.ovhtelecom.fr/manager-preprod/apiv6',
        // url: 'https://www.ovhtelecom.fr/manager/apiv6',
        url: "https://www.ovhtelecom.fr/engine/apiv6",
        loginUrl: "https://www.ovhtelecom.fr/manager/apiv6/session"
    },
    apiv7 : {
        url: "https://www.ovhtelecom.fr/engine/apiv7"
    },
    node  : {
        url : process.env.NODE_URL || "http://localhost:6969"
    },
    aapi : {
        url : "https://www.ovhtelecom.fr/engine/2api"
    },
    ws : {
        url: "https://www.ovhtelecom.fr/ws"
    }
};
