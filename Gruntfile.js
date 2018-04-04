"use strict";

module.exports = function (grunt) {
    var localConfig;
    try {
        localConfig = require("./server/config/local.env");
    } catch (e) {
        localConfig = {};
    }

    // Load grunt tasks automatically, when needed
    require("jit-grunt")(grunt, {
        express: "grunt-express-server",
        useminPrepare: "grunt-usemin",
        ngtemplates: "grunt-angular-templates",
        protractor: "grunt-protractor-runner",
        ngconstant: "grunt-ng-constant",
        postcss: "grunt-postcss"
    });

    var mode = grunt.option("mode") || "dev";

    var copyDevTest = [
        "components/**/*.html",
        "components/**/assets/**/*",
        "assets/**/*",
        "assets/images/{,*/}*.{webp}",
        "assets/fonts/**/*",
        "assets/sounds/**/*",
        "app/**/!(*.tpl).html",
        "index.html"
    ];

    grunt.loadTasks("./tasks");

    // Time how long tasks take. Can help when optimizing build times
    require("time-grunt")(grunt);

    // Define the configuration for all the tasks
    grunt.initConfig({
        // Project settings
        pkg: grunt.file.readJSON("package.json"),
        yeoman: {
            // configurable paths
            client: require("./bower.json").appPath || "client",
            server: "server",
            dist: "dist",
            tmp: ".tmp"
        },

        //#######################################################################################
        //##      TASK: express                                                                ##
        //##            Create a local server                                                  ##
        //#######################################################################################
        express: {
            options: {
                port: process.env.PORT || 8181
            },
            dev: {
                options: {
                    script: "<%= yeoman.server %>/app.js"
                }
            },
            prod: {
                options: {
                    script: "<%= yeoman.dist %>/<%= yeoman.server %>/app.js"
                }
            }
        },

        //#######################################################################################
        //##      TASK: watch                                                                  ##
        //##            Watch files and manage task on fil changes                             ##
        //#######################################################################################
        watch: {
            options: {
                interval: 1000
            },
            tpl_less: {
                files: ["<%= yeoman.client %>/app/app.tpl.less"],
                tasks: ["copy:tpl_less"]
            },
            tpl_index: {
                files: ["<%= yeoman.client %>/index.tpl.html"],
                tasks: ["copy:tpl_index", "wiredep:client", "injector:scripts", "injector:css"]
            },
            tpl_karma: {
                files: ["karma.conf.tpl.js"],
                tasks: ["copy:tpl_karma", "wiredep:test"]
            },
            injectJS: {
                files: [
                    "<%= yeoman.client %>/{app,components}/**/!(*.spec|*.mock).js",
                    "!<%= yeoman.client %>/app/app.js"
                ],
                tasks: ["newer:babel:dist", "injector:scripts"]
            },

            translations: {
                files: [
                    "<%= yeoman.client %>/{app,components}/**/translations/*.xml"
                ],
                tasks: ["ovhTranslation", "json_merge:component_translations"]
            },

            injectCss: {
                files: [
                    "<%= yeoman.client %>/{app,components,assets}/**/*.css"
                ],
                tasks: ["injector:css"]
            },

            jsTest: {
                files: [
                    "<%= yeoman.client %>/{app,components}/**/*.{spec,mock}.js"
                ],
                tasks: ["newer:eslint:all", "wiredep:test", "karma"]
            },

            less: {
                files: [
                    "<%= yeoman.client %>/{app,components,assets}/**/*.less",
                    "!<%= yeoman.client %>/app/app.tpl.less"
                ],
                tasks: ["injector:less", "less", "postcss"]
            },

            sass: {
                files: [
                    "<%= yeoman.client %>/app/**/*.scss"
                ],
                tasks: ["sass", "postcss"]
            },

            htmlTemplates: {
                files: [
                    "<%= yeoman.client %>/{app,components}/**/!(*.tpl).html"
                ],
                tasks: ["newer:copy:html"]
            },

            gruntfile: {
                files: ["Gruntfile.js"]
            },

            livereload: {
                files: [
                    "<%= yeoman.client %>/index.html",
                    "{.tmp,<%= yeoman.client %>}/{app,components}/**/*.{css,html}",
                    "{.tmp,<%= yeoman.client %>}/{app,components}/**/!(*.spec|*.mock).js",
                    "<%= yeoman.client %>/assets/images/{,*//*}*.{png,jpg,jpeg,gif,webp,svg}",
                    "<%= yeoman.client %>/{app,components}/**/translations/*.xml"
                ],
                options: {
                    livereload: true
                }
            },

            bower: {
                files: ["bower.json"],
                tasks: ["wiredep"]
            }
        },

        //#######################################################################################
        //##      TASK: eslint                                                                 ##
        //##            Make sure code styles are up to par and there are no obvious mistakes  ##
        //#######################################################################################
        eslint: {
            options: {
                quiet: true // Disable to see warning
            },
            all: [
                "<%= yeoman.client %>/{app,components}/**/!(*.spec|*.mock).js"
            ]
        },

        //#######################################################################################
        //##      TASK: babel                                                                  ##
        //##            For ES6 support                                                        ##
        //#######################################################################################
        babel: {
            options: {
                presets: ["es2015"]
            },
            dist: {
                files: [{
                    expand: true,
                    src: [
                        "<%= yeoman.client %>/{app,components}/**/*.js"
                    ],
                    dest: "<%= yeoman.dist %>"
                }]
            },
            test: {
                files: [{
                    expand: true,
                    src: [
                        "<%= yeoman.client %>/{app,components}/**/*.js"
                    ],
                    dest: "<%= yeoman.tmp %>"
                }]
            }
        },

        //#######################################################################################
        //##      TASK: clean                                                                  ##
        //##            Empties folders to start fresh                                         ##
        //#######################################################################################
        clean: {
            dist: {
                files: [
                    {
                        dot: true,
                        src: [
                            "<%= yeoman.tmp %>",
                            "<%= yeoman.dist %>/!(.git*|Procfile)**"
                        ]
                    }
                ]
            },
            server: "<%= yeoman.tmp %>",
            ngdocs: "docs"
        },

        //#######################################################################################
        //##      TASK: postcss                                                                ##
        //##            Add vendor prefixed styles                                             ##
        //#######################################################################################
        postcss: {
            options: {
                processors: [
                    // add fallbacks for rem units
                    require("pixrem")(),

                    // add vendor prefixes
                    require("autoprefixer")(
                        {
                            browsers: [">0%"]
                        }
                    )
                ]
            },
            dist: {
                files: {
                    "<%= yeoman.tmp %>/app/app.css": [
                        "<%= yeoman.tmp %>/app/app-scss.css",
                        "<%= yeoman.tmp %>/app/app.css"
                    ]
                }
            }
        },

        //#######################################################################################
        //##      TASK: wiredep                                                                ##
        //##            Automatically inject Bower components into the app and karma.conf.js   ##
        //#######################################################################################
        wiredep: {
            options: {
                exclude: [
                    "bower_components/flag-icon-css/css/flag-icon.min.css",
                    "/json3/",
                    "/es5-shim/",
                    "/cryptojs/",
                    "bower_components/messenger/build/css/messenger-theme-air.css",
                    "bower_components/messenger/build/css/messenger-theme-ice.css"
                ]
            },
            client: {
                src: "<%= yeoman.client %>/index.html",
                ignorePath: "<%= yeoman.client %>/"
            },
            less: {
                src: "<%= yeoman.client %>/app/app.less",
                ignorePath: "../bower_components/"
            },
            test: {
                src: "./karma.conf.js",
                devDependencies: true
            }
        },

        //#######################################################################################
        //##      TASK: rev                                                                    ##
        //##            Renames files for browser caching purposes                             ##
        //#######################################################################################
        rev: {
            dist: {
                files: {
                    src: [
                        "<%= yeoman.dist %>/client/{,*/}*.js",
                        "!<%= yeoman.dist %>/client/app/config.js",
                        "<%= yeoman.dist %>/client/{,*/}*.css",
                        "!<%= yeoman.dist %>/client/bower_components/*"
                    ]
                }
            }
        },

        //#######################################################################################
        //##      TASK: useminPrepare                                                          ##
        //##            Reads HTML for usemin blocks to enable smart builds that automatically ##
        //##            concat, minify and revision files. Creates configurations in memory so ##
        //##            additional tasks can operate on them                                   ##
        //#######################################################################################
        useminPrepare: {
            html: [
                "<%= yeoman.client %>/index.html"
            ],
            options: {
                dest: "<%= yeoman.dist %>/client"
            }
        },

        //#######################################################################################
        //##      TASK: usemin                                                                 ##
        //##            Performs rewrites based on rev and the useminPrepare configuration     ##
        //#######################################################################################
        usemin: {
            html: ["<%= yeoman.dist %>/client/{,*/}*.html"],
            css: [
                "<%= yeoman.dist %>/client/{,*/}*.css", "!<%= yeoman.dist %>/client/bower_components/*"
            ],
            js: [
                "<%= yeoman.dist %>/client/{,*/}*.js", "!<%= yeoman.dist %>/client/bower_components/*"
            ],
            options: {
                assetsDirs: [
                    "<%= yeoman.dist %>/client",
                    "<%= yeoman.dist %>/client/assets/images"
                ],
                // This is so we update image references in our ng-templates
                patterns: {
                    js: [
                        [
                            /(assets\/images\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))$/gm,
                            "Update the JS to reference our revved images"
                        ]
                    ]
                }
            }
        },

        //#######################################################################################
        //##      TASK: imagemin                                                               ##
        //##            Optimize images                                                        ##
        //#######################################################################################
        imagemin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: "<%= yeoman.client %>/assets/images",
                        src: "**/*.{png,jpg,jpeg,gif,svg}",
                        dest: "<%= yeoman.dist %>/client/assets/images"
                    }
                ]
            }
        },

        //#######################################################################################
        //##      TASK: svgmin                                                               ##
        //##            Optimize svg                                                           ##
        //#######################################################################################
        svgmin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: "<%= yeoman.client %>/assets/images",
                        src: "**/*.svg",
                        dest: "<%= yeoman.dist %>/client/assets/images"
                    }
                ]
            }
        },

        //#######################################################################################
        //##      TASK: ngAnnotate                                                             ##
        //##            Allow the use of non-minsafe AngularJS files. Automatically makes it   ##
        //##            minsafe compatible so Uglify does not destroy the ng references        ##
        //##            This will change `function($scope)` in ["$scope", function ($scope)]`  ##
        //######################################################################################
        ngAnnotate: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: "<%= yeoman.tmp %>/concat",
                        src: "*/**.js",
                        dest: "<%= yeoman.tmp %>/concat"
                    }
                ]
            }
        },

        //#######################################################################################
        //##      TASK: ngtemplates                                                            ##
        //##            Package all the html partials into a single javascript payload         ##
        //#######################################################################################
        ngtemplates: {
            options: {
                // This should be the name of your apps angular module
                module: "managerApp",
                htmlmin: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeEmptyAttributes: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true
                },
                usemin: "app/app.js"
            },
            main: {
                cwd: "<%= yeoman.client %>",
                src: ["components/**/*.html"],
                dest: "<%= yeoman.tmp %>/templates.js"
            },
            tmp: {
                cwd: "<%= yeoman.tmp %>",
                src: ["components/**/*.html"],
                dest: "<%= yeoman.tmp %>/tmp-templates.js"
            }
        },

        //#######################################################################################
        //##      TASK: copy                                                                   ##
        //##            Copies remaining files to places other tasks can use                   ##
        //#######################################################################################
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: "<%= yeoman.client %>",
                    dest: "<%= yeoman.dist %>/client",
                    src: [
                        "*.{ico,png,txt}",
                        "bower_components/**/*.{ttf,woff,woff2,svg,eot}",
                        "bower_components/bootstrap/dist/css/bootstrap.min.css",
                        "bower_components/angular-i18n/**.js",
                        "components/**/*.html",
                        "components/**/assets/**/*",
                        ".htaccess",
                        "assets/**/*",
                        "assets/images/{,*/}*.{webp}",
                        "assets/fonts/**/*",
                        "assets/sounds/**/*",
                        "app/**/!(*.tpl).html",
                        "index.html"
                    ]
                }, {
                    expand: true,
                    cwd: "<%= yeoman.tmp %>/images",
                    dest: "<%= yeoman.dist %>/client/assets/images",
                    src: ["generated/*"]
                }, {
                    expand: true,
                    dest: "<%= yeoman.dist %>",
                    src: [
                        "package.json",
                        "<%= yeoman.server %>/**/*"
                    ]
                }, {
                    expand : true,
                    cwd: "<%= yeoman.tmp %>",
                    dest: "<%= yeoman.dist %>/client",
                    src : ["**/translations/*.json"]
                }, {
                    cwd: "<%= yeoman.client %>",
                    expand: true,
                    dest: "<%= yeoman.dist %>/client",
                    src: "usertests/**/*"
                }, {
                    expand: true,
                    cwd: "<%= yeoman.client %>",
                    dest: "<%= yeoman.dist %>/client",
                    src: [
                        "bower_components/**/dist/**/Messages_*.json"
                    ]
                }]
            },
            styles: {
                expand: true,
                cwd: "<%= yeoman.client %>",
                dest: "<%= yeoman.tmp %>/",
                src: ["{app,components}/**/*.css"]
            },
            tpl_less: {
                src: "<%= yeoman.client %>/app/app.tpl.less",
                dest: "<%= yeoman.client %>/app/app.less"
            },
            tpl_index: {
                src: "<%= yeoman.client %>/index.tpl.html",
                dest: "<%= yeoman.client %>/index.html"
            },
            tpl_karma: {
                src: "karma.conf.tpl.js",
                dest: "karma.conf.js"
            },
            dev: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: "<%= yeoman.client %>",
                    dest: "<%= yeoman.dist %>/client",
                    src: copyDevTest
                }]
            },
            test: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: "<%= yeoman.client %>",
                    dest: "<%= yeoman.tmp %>/client",
                    src: copyDevTest
                }]
            },
            html: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: "<%= yeoman.client %>",
                    dest: "<%= yeoman.dist %>/client",
                    src: [
                        "{app,components}/**/!(*.tpl).html"
                    ]
                }]
            },
            ngdocs: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: "node_modules/ovh-ui-kit-bs/dist/",
                    dest: "docs/css",
                    src: [
                        "**/*"
                    ]
                }]
            }
        },

        //#######################################################################################
        //##      TASK: concurrent                                                             ##
        //##            Run some tasks in parallel to speed up the build process               ##
        //#######################################################################################
        concurrent: {
            templates: [
                "copy:tpl_less",
                "copy:tpl_index",
                "copy:tpl_karma"
            ],
            dist: [
                "less",
                "sass",
                "imagemin",
                "svgmin"
            ]
        },

        //#######################################################################################
        //##      TASK: karma                                                                  ##
        //##            Test settings                                                          ##
        //#######################################################################################
        karma: {
            unit: {
                configFile: "karma.conf.js",
                singleRun: true
            }
        },

        //#######################################################################################
        //##      TASK: protractor                                                             ##
        //##            E2E tests                                                              ##
        //#######################################################################################
        protractor: {
            options: {
                configFile: "protractor.conf.js"
            },
            browser: {
                options: {
                    args: {
                        browser: grunt.option("browser") || "phantomjs",
                        suite: grunt.option("suite") || "full"
                    }
                }
            }
        },

        //#######################################################################################
        //##      TASK: env                                                                    ##
        //##            Inject environment variables                                           ##
        //#######################################################################################
        env: {
            test: {
                NODE_ENV: "test"
            },
            prod: {
                NODE_ENV: "production"
            },
            all: localConfig
        },

        //#######################################################################################
        //##      TASK: less                                                                   ##
        //##            Compiles Less to CSS                                                   ##
        //#######################################################################################
        less: {
            options: {
                paths: [
                    "<%= yeoman.client %>/bower_components",
                    "<%= yeoman.client %>/app",
                    "<%= yeoman.client %>/components",
                    "<%= yeoman.client %>/assets/styles",
                    "node_modules"
                ],
                plugins: [
                    require("less-plugin-remcalc")
                ]
            },
            server: {
                files: {
                    "<%= yeoman.tmp %>/app/app.css": "<%= yeoman.client %>/app/app.less"
                }
            }
        },

        sass: {
            options: {
                sourceMap: true,
                includePaths: ["."],
                outputStyle: "expanded"
            },
            dist: {
                files: {
                    "<%= yeoman.tmp %>/app/app-scss.css": "<%= yeoman.client %>/app/app-scss.scss"
                }
            }
        },

        //#######################################################################################
        //##      TASK: injector                                                               ##
        //##            Inject script files into index.html (doesn"t include bower)            ##
        //##            Inject css files into index.html                                       ##
        //##            Inject less files in app.less                                          ##
        //#######################################################################################
        injector: {
            options: {},
            // Inject application script files into index.html (doesn"t include bower)
            scripts: {
                options: {
                    transform: function (filePath) {
                        var yoDist = grunt.config.get("yeoman.dist");
                        filePath = filePath.replace("/" + yoDist + "/client/", "");
                        return "<script src=\"" + filePath + "\"></script>";
                    },
                    sort: function (a, b) {
                        var module = /\.module\.js$/;
                        var aMod = module.test(a);
                        var bMod = module.test(b);
                        // inject *.module.js first
                        return (aMod === bMod) ? 0 : (aMod ? -1 : 1);
                    },
                    starttag: "<!-- injector:js -->",
                    endtag: "<!-- endinjector -->"
                },
                files: {
                    "<%= yeoman.client %>/index.html": [
                        "<%= yeoman.dist %>/<%= yeoman.client %>/{app,components}/**/!(*.spec|*.mock).js",
                        "!<%= yeoman.dist %>/<%= yeoman.client %>/app/config/*.js",
                        "<%= yeoman.dist %>/<%= yeoman.client %>/app/config/" + mode + ".js",
                        "<%= yeoman.dist %>/<%= yeoman.client %>/app/config/all.js",
                        "!<%= yeoman.dist %>/<%= yeoman.client %>/app/app.js"
                    ]
                }
            },

            // Inject component less into app.less
            less: {
                options: {
                    transform: function (filePath) {
                        filePath = filePath.replace("/<%= yeoman.client %>/app/", "");
                        filePath = filePath.replace("/<%= yeoman.client %>/components/", "../components/");
                        filePath = filePath.replace("/client", "client");
                        return "@import \"" + filePath + "\";";
                    },
                    starttag: "// injector",
                    endtag: "// endinjector",
                    plugins: [
                        require("less-plugin-remcalc")
                    ]
                },
                files: {
                    "<%= yeoman.client %>/app/app.less": [
                        "<%= yeoman.client %>/{app,components}/**/*.less",
                        "!<%= yeoman.client %>/app/{app,app.tpl}.less"
                    ]
                }
            },

            // Inject component css into index.html
            css: {
                options: {
                    transform: function (filePath) {
                        filePath = filePath.replace("/<%= yeoman.client %>/", "");
                        filePath = filePath.replace("/<%= yeoman.tmp %>/", "");
                        return "<link rel=\"stylesheet\" href=\"" + filePath + "\">";
                    },
                    starttag: "<!-- injector:css -->",
                    endtag: "<!-- endinjector -->"
                },
                files: {
                    "<%= yeoman.client %>/index.html": [
                        "<%= yeoman.client %>/{app,components}/**/*.css"
                    ]
                }
            }
        },

        //#######################################################################################
        //##      TASK: json_merge                                                             ##
        //##            Merge json files in one                                                ##
        //#######################################################################################
        json_merge: {
            component_translations: {
                files: {
                    "<%= yeoman.tmp %>/app/components/translations/Messages_cs_CZ.json": [
                         "<%= yeoman.tmp %>/components/**/Messages_cs_CZ.json",
                         "<%= yeoman.client %>/bower_components/**/Messages_cs_CZ.json"
                    ],
                    "<%= yeoman.tmp %>/app/components/translations/Messages_de_DE.json": [
                         "<%= yeoman.tmp %>/components/**/Messages_de_DE.json",
                         "<%= yeoman.client %>/bower_components/**/Messages_de_DE.json"
                    ],
                    "<%= yeoman.tmp %>/app/components/translations/Messages_en_CA.json": [
                         "<%= yeoman.tmp %>/components/**/Messages_en_CA.json",
                         "<%= yeoman.client %>/bower_components/**/Messages_en_CA.json"
                    ],
                    "<%= yeoman.tmp %>/app/components/translations/Messages_en_GB.json": [
                        "<%= yeoman.tmp %>/components/**/Messages_en_GB.json",
                        "<%= yeoman.client %>/bower_components/**/Messages_en_GB.json"
                    ],
                    "<%= yeoman.tmp %>/app/components/translations/Messages_en_US.json": [
                         "<%= yeoman.tmp %>/components/**/Messages_en_US.json",
                         "<%= yeoman.client %>/bower_components/**/Messages_en_US.json"
                    ],
                    "<%= yeoman.tmp %>/app/components/translations/Messages_es_ES.json": [
                         "<%= yeoman.tmp %>/components/**/Messages_es_ES.json",
                         "<%= yeoman.client %>/bower_components/**/Messages_es_ES.json"
                    ],
                    "<%= yeoman.tmp %>/app/components/translations/Messages_es_US.json": [
                         "<%= yeoman.tmp %>/components/**/Messages_es_US.json",
                         "<%= yeoman.client %>/bower_components/**/Messages_es_US.json"
                    ],
                    "<%= yeoman.tmp %>/app/components/translations/Messages_fi_FI.json": [
                         "<%= yeoman.tmp %>/components/**/Messages_fi_FI.json",
                         "<%= yeoman.client %>/bower_components/**/Messages_fi_FI.json"
                    ],
                    "<%= yeoman.tmp %>/app/components/translations/Messages_fr_CA.json": [
                         "<%= yeoman.tmp %>/components/**/Messages_fr_CA.json",
                         "<%= yeoman.client %>/bower_components/**/Messages_fr_CA.json"
                    ],
                    "<%= yeoman.tmp %>/app/components/translations/Messages_fr_FR.json": [
                        "<%= yeoman.tmp %>/components/**/Messages_fr_FR.json",
                        "<%= yeoman.client %>/bower_components/**/Messages_fr_FR.json"
                    ],
                    "<%= yeoman.tmp %>/app/components/translations/Messages_it_IT.json": [
                         "<%= yeoman.tmp %>/components/**/Messages_it_IT.json",
                         "<%= yeoman.client %>/bower_components/**/Messages_it_IT.json"
                    ],
                    "<%= yeoman.tmp %>/app/components/translations/Messages_lt_LT.json": [
                         "<%= yeoman.tmp %>/components/**/Messages_lt_LT.json",
                         "<%= yeoman.client %>/bower_components/**/Messages_lt_LT.json"
                    ],
                    "<%= yeoman.tmp %>/app/components/translations/Messages_nl_NL.json": [
                         "<%= yeoman.tmp %>/components/**/Messages_nl_NL.json",
                         "<%= yeoman.client %>/bower_components/**/Messages_nl_NL.json"
                    ],
                    "<%= yeoman.tmp %>/app/components/translations/Messages_pl_PL.json": [
                         "<%= yeoman.tmp %>/components/**/Messages_pl_PL.json",
                         "<%= yeoman.client %>/bower_components/**/Messages_pl_PL.json"
                    ],
                    "<%= yeoman.tmp %>/app/components/translations/Messages_pt_PT.json": [
                         "<%= yeoman.tmp %>/components/**/Messages_pt_PT.json",
                         "<%= yeoman.client %>/bower_components/**/Messages_pt_PT.json"
                    ]
                }
            }
        },

        //#######################################################################################
        //##      TASK: ovhTranslation                                                         ##
        //##            Generate json translation files from XML                               ##
        //#######################################################################################
        ovhTranslation: {
            files: {
                expand: true,
                flatten: false,
                cwd: "client",
                src: [
                    "app/**/translations/*.xml",
                    "components/**/translations/*.xml",
                    "bower_components/**/translations/*.xml"
                ],
                dest: "<%= yeoman.tmp %>",
                filter: "isFile",
                extendFrom: ["fr_FR", "en_GB"]
            }
        },

        //#######################################################################################
        //##      TASK: ngconstant                                                             ##
        //##            Dynamically generate angular constants                                 ##
        //#######################################################################################
        ngconstant: {
            options: {
                deps: null,
                name: "managerApp",
                dest: "<%= yeoman.client %>/app/config/custom.js",
                serializerOptions: {
                    indent: "    ",
                    no_trailing_comma: true,
                    quote: "\""
                },
                template: grunt.file.read("./tasks/constant.tpl.ejs"),
                constants: {
                    managerAppConfigVersion: "<%= pkg.version %>"
                }
            },
            build: {}
        },

        //#######################################################################################
        //##      TASK: ngdocs                                                                 ##
        //##            Build some documentation.                                              ##
        //#######################################################################################
        ngdocs: {
            options: {
                dest: "docs/",
                title: "Telecom - Documentation",
                titleLink: "#voip/managerApp",
                startPage: "voip/managerApp",
                template: "tasks/docs/index-bs3.tmpl",
                styles: [
                    "tasks/docs/css/styles.css",
                    "tasks/docs/css/ovh-ui-kit-bs.css"
                ],
                sourceLink: "https://github.com/ovh-ux/ovh-manager-telecom/tree/master/{{file}}#L{{codeline}}"
            },
            voip: {
                src: ["client/components/telecom/voip/**/*.js"],
                title: "Telephony API",
                api: true
            }
        }
    });

    // Used for delaying livereload until after server has restarted
    grunt.registerTask("wait", function () {
        grunt.log.ok("Waiting for server reload...");

        var done = this.async();

        setTimeout(function () {
            grunt.log.writeln("Done waiting!");
            done();
        }, 1500);
    });

    grunt.registerTask("express-keepalive", "Keep grunt running", function () {
        this.async();
    });

    grunt.registerTask("serve", function (target) {

        if (target === "dist") {
            return grunt.task.run([
                "build",
                "env:all",
                "env:prod",
                "express:prod",
                "wait",
                "express-keepalive"
            ]);
        }

        grunt.task.run([
            "clean:dist",
            "env:all",
            "babel:dist",
            "ngconstant",
            "concurrent:templates",
            "injector",
            "wiredep:less",
            "wiredep:client",
            "less",
            "sass",
            "postcss",
            "ovhTranslation",
            "json_merge",
            "copy:dev",
            "express:dev",
            "wait",
            "watch"
        ]);
    });

    grunt.registerTask("server", function () {
        grunt.log.warn("The `server` task has been deprecated. Use `grunt serve` to start a server.");
        grunt.task.run(["serve"]);
    });

    grunt.registerTask("test", function (target, option) {
        return grunt.task.run([
            "clean:dist",
            "env:all",
            "babel:test",
            "ngconstant",
            "concurrent:templates",
            "copy:test",
            "wiredep:client",
            "wiredep:test",
            "eslint:all",
            "karma:unit"
        ]);
    });

    grunt.registerTask("docs", function (target, option) {
        return grunt.task.run([
            "clean:ngdocs",
            "ngdocs",
            "copy:ngdocs"
        ]);
    });

    grunt.registerTask("buildProd", [
        "clean",
        "babel:dist",
        "ngconstant",
        "concurrent:templates",
        "injector",
        "wiredep:less",
        "wiredep:client",
        "concurrent:dist",
        "useminPrepare",
        "postcss",
        "ngtemplates",
        "ovhTranslation",
        "json_merge",
        "concat",
        "ngAnnotate",
        "copy:dist",
        "cssmin",
        "uglify",
        "rev",
        "usemin",
        "ngdocs"
    ]);

    grunt.registerTask("default", [
        "newer:eslint",
        "test",
        "build"
    ]);

    /*
     * --mode=prod
     * --mode=dev
     */
    grunt.registerTask("build", "Build", function () {
        grunt.log.subhead("You build in [" + mode + "] mode.");
        switch (mode) {
        case "dev":
        case "prod":
            grunt.task.run("buildProd");
            break;
        default:
            grunt.verbose.or.write("You try to build in a weird mode [" + mode + "]").error();
            grunt.fail.warn("Please try with --mode=dev|prod");
        }
    });
};
