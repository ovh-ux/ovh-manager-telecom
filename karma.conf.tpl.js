// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function (config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: "",
        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ["jasmine"],

        // list of files / patterns to load in the browser
        files: [
            // bower:js
            // endbower
            "client/bower_components/at-internet-smarttag-manager/dist/smarttag.js",
            ".tmp/client/app/app.js",
            ".tmp/app/config.js",
            ".tmp/client/{app,components}/**/*.module.js",
            ".tmp/client/{app,components}/**/*.js",
            ".tmp/client/{app,components}/**/*.html",

            { pattern: "client/{app,components,bower_components}/**/*.dt.spec.json", included: false }
        ],

        reporters: ["nyan", "junit"],

        // junit reporter config
        junitReporter: {
            outputDir: "test-reports",
            outputFile: "../junit-client-report.xml"
        },

        preprocessors: {
            "**/*.html": "html2js"
        },

        ngHtml2JsPreprocessor: {
            stripPrefix: ".tmp/client/",
            moduleName: "templates"
        },

        ngJade2JsPreprocessor: {
            stripPrefix: ".tmp/client/"
        },

        // list of files / patterns to exclude
        exclude: [],

        // web server port
        port: 8080,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ["PhantomJS"],
        browserNoActivityTimeout: 60000,
        phantomjsLauncher: {
            exitOnResourceError: false
        },

        // /!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\ FOR DEBUGING : /!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\
        // - uncomment customLaunchers block ;
        // - modify browsers options and set : browsers: ["Chrome", "Chrome_without_security"].
        // Launch grunt test or grunt karma. You will have more verbose error logs.

        // customLaunchers: {
        //     "Chrome_without_security": {
        //         base: "Chrome",
        //         flags: ["--disable-web-security"]
        //     }
        // },

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false
    });
};
