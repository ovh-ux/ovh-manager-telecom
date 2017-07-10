'use strict';

// Development specific configuration
// ==================================
module.exports = {
  "transports" : [
    {
        "type"        : "Console",
        "config"      : {
            "name"        : "Common errors",
            "colorize"    : true,
            "prettyPrint" : true,
            "timestamp"   : true
        }
    }
  ]
};
