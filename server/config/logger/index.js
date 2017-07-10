'use strict';

var path = require('path');
var _ = require('lodash');

function requiredProcessEnv(name) {
  if(!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

// All configurations will extend these options
// ============================================
var all = {
	"levels": {
		"emergency" : 0,
		"alert"     : 10,
		"critical"  : 20,
		"error"     : 30,
		"warning"   : 40,
		"notice"    : 50,
		"info"      : 60,
		"debug"     : 70,
		"access"    : 80
	},
  	"colors": {
	    "emergency" : "pink",
	    "alert"     : "purple",
	    "critical"  : "red",
	    "error"     : "orange",
	    "warning"   : "yellow",
	    "notice"    : "blue",
	    "info"      : "yellow",
	    "debug"     : "gray",
	    "access"    : "green"
	}  	
};

module.exports = _.merge(all, require('./' + process.env.NODE_ENV + '.js') || {});