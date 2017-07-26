var express = require('express');
var morgan = require('morgan');
var path = require('path');
var config = require('./environment');
var bodyParser = require('body-parser');
var _ = require('lodash');

function maybe(fn) {
    return function(req, res, next) {
        // Body Parser only for Tera and login
        if (_.startsWith(req.path, '/tera/')  || req.path === "/loginSessionv6") {
            fn(req, res, next);
        } else {
            next();
        }
    }
}

module.exports = function (app) {
    var env = app.get('env');

    //app.use(require('connect-livereload')());

    app.use(maybe(bodyParser.urlencoded()));
    app.use(maybe(bodyParser.json()));

    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');

    if ('production' === env) {
        app.use(express.static(path.join(config.root, 'public')));
        app.set('appPath', path.join(config.root, '/public'));
    } else {
        app.set('appPath', 'dist/client');
    }

};
