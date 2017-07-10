'use strict';

// Production specific configuration
// =================================
module.exports = {
    "transports" : [
        {
          "type"        : "OvhDailyRotateFile",
          "config"      : {
            "name"        : "access logs",
            "filename"    : "./server/logs/access-",
            "datePattern" : "yyyy-MM-dd.log",
            "json"        : false,
            "gzip"        : true
          }
        }
    ]
};
