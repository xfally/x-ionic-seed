(function() {
    'use strict';

    /**
     * @description
     * Afford multi-base-services.
     *
     * e.g. mod manage, local storage, network request, i18n translate...
     *
     * @ngdoc overview
     * @name service
     * @requires protocol
     * @requires directive
     * @requires ionic
     * @requires ngAnimate
     * @requires ngMessages
     * @requires LocalStorageModule
     * @requires toastr
     * @requires pascalprecht.translate
     * @requires oc.lazyLoad
     * @requires angular-loading-bar
     * @requires cfp.loadingBar
     */
    angular.module('service', ['protocol', 'directive', 'ionic', 'ngAnimate', 'ngMessages', 'LocalStorageModule', 'toastr', 'pascalprecht.translate', 'oc.lazyLoad', 'angular-loading-bar', 'cfp.loadingBar'])

    /**
     * @description
     * Service constant.
     *
     * All service constant data are defined here.
     *
     * Upper mods can use `serviceProvider` to config it.
     *
     * TIP: The difference between constant() and value() is not what we think, but is
     *      - constant(obj): registers a value/object that can be accessed by providers and services.
     *      - value(obj): registers a value/object that can only be accessed by services, not providers.
     *
     * @memberof service
     */
    .constant('serviceConstant', {
        HOME_PATH: '/',
        MOD: {
            PATH: "mod",
            ENTRY: "entry.json",
            HTML: "mod.html",
            JS: "mod.js",
            CSS: "mod.css",
            IMG_PATH: "img",
            // Note: Just define core mods here!
            COMMON: 'common', // www/mod/common
            HOME: 'home', // www/mod/home
            ABOUT: 'about', // www/mod/about
            LOGIN: 'login' // www/mod/login
        },
        DEFAULT_LOGIN_ACCOUNT: {
            // hard-coded username
            USERNAME: 'guest',
            // hard-coded password.
            PASSWORD: '123456'
        },
        SERVER_INFO: {
            PROTOCOL: 'http://',
            SERVER_IP: '192.168.1.1',
            SERVER_DOMAIN_NAME: 'starter.ionic.xfally.github.io',
            AUTH_CGI: 'cgi-bin/auth',
            WEB_CGI: 'cgi-bin/web',
            AUTH_MODULE: 'auth',
            WEB_MODULE: 'web',
            STATUS_MODULE: 'status'
        },
        AJAX_TIMEOUT: {
            SHORT: 2 * 1000, // 2s, usually for server or login detecting
            MID: 5 * 1000, // 5s, the default timeout, usually for normal data request
            LONG: 20 * 1000 // 20s, usually for long time request, e.g. big data sending
        },
        AJAX_ACTION: {
            LOAD: 0,
            LOGIN: 1,
            CHECK_ATTEMPT: 2,
            CLOSE: 3,
            UPDATE: 4,
            KEEP_ALIVE: 2,
            UNSET_DEFAULT: 3
        },
        AJAX_RESULT: {
            SUCCESS: 0,
            COMMON_ERR: -1,
            KICKED_OUT: -2,
            TOKEN_ERROR: -3
        },
        AUTH_RESULT: {
            SUCCESS: 0,
            HAVE_LOGIN: 1,
            PWD_WRONG: 2,
            IP_LOCKED: 3,
            OTHER_LOGIN: 4,
            UNKNOWN: 5
        },
        // You can define them by serviceProvider.setGoHomeWhen in config phase, and change them by linkService in runtime phase.
        GO_HOME_WHEN: {
            SERVER_DISCONNECT: true, // should child mod go back home when server disconnected?
            SERVER_DISCONNECT_MAX: 6, // Only when SERVER_DISCONNECT reach max count, then do GO_HOME_WHEN action.
            COMMON_ERR: true, // should child mod go back home when ajax common error?
            KICKED_OUT: true, // should child mod go back home when login be kicked out?
            TOKEN_ERROR: false // should child mod go back home when auth (token) error?
        },
        // Console log switch
        LOG_ON: true,
        LOG_LEVELS: {
            "NONE": 0,
            "LOG": 1,
            "ERROR": 2,
            "WARN": 3,
            "INFO": 4,
            "DEBUG": 5
        },
        LOG_LEVEL: 5 // TODO: DEBUG level now, change to WARN before release.
    })

    /**
     * @description
     * Service value.
     *
     * @memberof service
     */
    .value('serviceValue', {
        // Here, we afford two platform info,
        // one from $ionicPlatform
        // @example
        // {
        //     currentPlatform: "ios",
        //     currentPlatformVersion: 7,
        //     deviceInformation: Object,
        //     isAndroid: false,
        //     isIOS: true,
        //     isIPad: false,
        //     isWebView: false,
        //     isWindowsPhone: false
        // }
        ionicPlatform: {},
        // two from cordova plugin device (not work on PC browser)
        // Depending on the device, a few examples are:
        //   - "Android"
        //   - "BlackBerry 10"
        //   - Browser:         returns "MacIntel" on Mac
        //                      returns "Win32" on Windows
        //   - "iOS"
        //   - "WinCE"
        //   - "Tizen"
        devicePlatform: undefined,
        viewport: {
            minGoodViewportHeight: 568
        },
        // menus in home mod
        menus: {
            sideMenus: [],
            gridMenus: []
        },
        serverAddress: '',
        isLogin: false,
        serverDisconnectedCount: 0 // Refer to serviceConstant.GO_HOME_WHEN.SERVER_DISCONNECT.
    })

    /**
     * @description
     * Config localStorage.
     *
     * Refer to https://github.com/grevory/angular-local-storage#configuration
     *
     * @memberof service
     */
    .config(['localStorageServiceProvider', 'protocolConstant',
        function(localStorageServiceProvider, protocolConstant) {
            localStorageServiceProvider
                .setPrefix(protocolConstant.APP.ID)
                // 'localStorage' or 'sessionStorage'
                .setStorageType('localStorage')
                // 0 means never expire
                .setStorageCookie(0, '/');
        }
    ])

    /**
     * @description
     * Config toastr.
     *
     * Refer to https://github.com/Foxandxss/angular-toastr
     *
     * @memberof service
     */
    .config(['toastrConfig',
        function(toastrConfig) {
            angular.extend(toastrConfig, {
                extendedTimeOut: 1000,
                timeOut: 2 * 1000,
                tapToDismiss: true,
                newestOnTop: true,
                positionClass: 'toast-top-full-width',
                preventDuplicates: false,
                preventOpenDuplicates: true,
                target: 'body'
            });
        }
    ])

    /**
     * @description
     * Config translation/i18n.
     *
     * Refer to https://angular-translate.github.io/docs/#/api
     *
     * @memberof service
     */
    .config(['$translateProvider', '$translatePartialLoaderProvider',
        function($translateProvider, $translatePartialLoaderProvider) {
            $translateProvider
                .useSanitizeValueStrategy('escape')
                .useLoader('$translatePartialLoader', {
                    // every mod should have its own i18n file
                    urlTemplate: 'mod/{part}/i18n/{lang}.json'
                })
                .registerAvailableLanguageKeys(['en', 'zh'], {
                    'en_US': 'en',
                    'en_UK': 'en',
                    'cmn-Hans-CN': 'zh',
                    'cmn-Hant-HK': 'zh',
                    'cmn-Hant-TW': 'zh',
                    'zh-Hans': 'zh',
                    'zh-Hant': 'zh',
                    'zh_CN': 'zh',
                    'zh_TW': 'zh'
                })
                .fallbackLanguage(['zh', 'en'])
                .determinePreferredLanguage();
            //.preferredLanguage('zh');
        }
    ])

    /**
     * @description
     * Config ocLazyLoad.
     *
     * Refer to https://oclazyload.readme.io/docs/oclazyloadprovider
     *
     * @memberof service
     */
    .config(['$ocLazyLoadProvider',
        function($ocLazyLoadProvider) {
            $ocLazyLoadProvider.config({
                events: true
            });
        }
    ])

    /**
     * @description
     * Config router rule.
     *
     * Refer to https://github.com/angular-ui/ui-router
     *
     * @memberof service
     */
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
        function($stateProvider, $urlRouterProvider, $locationProvider) {
            // Redirect all other unknown url to home page
            // TIPs: As Provider is global useful in one ng-app, so all other child pages will enjoy this configuration.
            $urlRouterProvider.otherwise('home');
            // Use Hashbang mode, not HTML5 mode, because the later one needs server side (e.g. express, httpd...) configuration.
            // and has no prefix, because don't like search engine (e.g. Google, Baidu...)!
            $locationProvider.html5Mode(false).hashPrefix('');
        }
    ])

    /**
     * @description
     * Config loading bar.
     *
     * Refer to https://github.com/chieffancypants/angular-loading-bar
     *
     * @memberof service
     */
    .config(['cfpLoadingBarProvider',
        function(cfpLoadingBarProvider) {
            cfpLoadingBarProvider.includeSpinner = false;
            cfpLoadingBarProvider.autoIncrement = false;
        }
    ])

    /**
     * @description
     * Run once.
     *
     * @memberof service
     */
    .run(['$ionicPlatform', 'serviceConstant', 'serviceValue', 'logService', 'modService',
        function($ionicPlatform, serviceConstant, serviceValue, logService, modService) {
            // Trigger a callback once the device is ready, or immediately
            // if the device is already ready. This method can be run from
            // anywhere and does not need to be wrapped by any additonal methods.
            // When the app is within a WebView (Cordova), it’ll fire
            // the callback once the device is ready. If the app is within
            // a web browser, it’ll fire the callback after window.load.
            // Please remember that Cordova features (Camera, FileSystem, etc) still
            // will not work in a web browser.
            $ionicPlatform.ready(function() {
                // init platform info
                serviceValue.ionicPlatform = {
                    deviceInformation: ionic.Platform.device(),
                    isWebView: ionic.Platform.isWebView(),
                    isIPad: ionic.Platform.isIPad(),
                    isIOS: ionic.Platform.isIOS(),
                    isAndroid: ionic.Platform.isAndroid(),
                    isWindowsPhone: ionic.Platform.isWindowsPhone(),
                    currentPlatform: ionic.Platform.platform(),
                    currentPlatformVersion: ionic.Platform.version()
                };
                if (window.device) {
                    serviceValue.devicePlatform = device.platform;
                }
                var refreshViewportSize = function() {
                    // Refer to http://www.w3school.com.cn/jsref/prop_win_innerheight_innerwidth.asp
                    serviceValue.viewport.height = window.innerHeight ? window.innerHeight : document.body.clientHeight;
                    serviceValue.viewport.width = window.innerWidth ? window.innerWidth : document.body.clientWidth;
                    serviceValue.viewport.orientation = (serviceValue.viewport.height >= serviceValue.viewport.width || serviceValue.viewport.height >= serviceValue.viewport.minGoodViewportHeight) ? 'portrait' : 'landscape';
                }
                refreshViewportSize();
                //logService.debug("init viewport height=" + serviceValue.viewport.height);
                //logService.debug("init viewport width=" + serviceValue.viewport.width);
                //logService.debug("init viewport orientation=" + serviceValue.viewport.orientation);
                window.addEventListener("resize", function() {
                    refreshViewportSize();
                    //logService.debug("resize viewport height=" + serviceValue.viewport.height);
                    //logService.debug("resize viewport width=" + serviceValue.viewport.width);
                    //logService.debug("resize viewport orientation=" + serviceValue.viewport.orientation);
                });
                // init http server address
                serviceValue.serverAddress = serviceConstant.SERVER_INFO.SERVER_DOMAIN_NAME;
                // init all mods
                modService.initMods();
            });
        }
    ])

    /**
     * @description
     * Service provider.
     *
     * Config App service's behavior. Overwrite any constant that need be customed in your App.
     *
     * @memberof service
     * @ngdoc provider
     * @name serviceProvider
     * @requires serviceConstant
     */
    .provider('service', ['serviceConstant',
        function(serviceConstant) {
            /**
             * @description
             * Set mod info, e.g. mod path, entry file, html file, some mod name...
             *
             * @example
             * angular.module('mod.home', ['service'])
             * .config(['serviceProvider', function(serviceProvider) {
             *     serviceProvider.setModInfo({
             *         PATH      : "mod",
             *         ENTRY     : "entry.json",
             *         HTML      : "mod.html",
             *         JS        : "mod.js",
             *         CSS       : "mod.css",
             *         IMG_PATH  : "img",
             *         COMMON    : 'common',	// www/mod/common
             *         HOME      : 'home',		// www/mod/home
             *         ABOUT     : 'about',	// www/mod/about
             *         LOGIN     : 'login'		// www/mod/login
             *     });
             * }])
             *
             * @memberof serviceProvider
             * @alias setModInfo
             * @param {object} opts The new options.
             */
            this.setModInfo = function(opts) {
                angular.extend(serviceConstant.MOD, opts);
                return this;
            }

            /**
             * @description
             * Set default login account, e.g. username, password...
             *
             * @example
             * angular.module('mod.home', ['service'])
             * .config(['serviceProvider', function(serviceProvider) {
             *     serviceProvider.setDefaultLoginAccount({
             *         USERNAME  : 'guest',
             *         PASSWORD  : '123456'
             *     });
             * }])
             *
             * @memberof serviceProvider
             * @alias setDefaultLoginAccount
             * @param {object} opts The new options.
             */
            this.setDefaultLoginAccount = function(opts) {
                angular.extend(serviceConstant.DEFAULT_LOGIN_ACCOUNT, opts);
                return this;
            }

            /**
             * @description
             * Set server info, e.g. server ip, cgi path, some module name...
             *
             * @example
             * angular.module('mod.home', ['service'])
             * .config(['serviceProvider', function(serviceProvider) {
             *     serviceProvider.setServerInfo({
             *         PROTOCOL           : 'http://',
             *         SERVER_IP          : '192.168.1.1',
             *         SERVER_DOMAIN_NAME : 'starter.ionic.xfally.github.io',
             *         AUTH_CGI           : 'cgi-bin/auth',
             *         WEB_CGI            : 'cgi-bin/web',
             *         AUTH_MODULE        : 'authenticator',
             *         WEB_MODULE         : 'webServer',
             *         STATUS_MODULE      : 'status'
             *     });
             * }])
             *
             * @memberof serviceProvider
             * @alias setServerInfo
             * @param {object} opts The new options.
             */
            this.setServerInfo = function(opts) {
                angular.extend(serviceConstant.SERVER_INFO, opts);
                return this;
            }

            /**
             * @description
             * Set ajax timeout.
             *
             * @example
             * angular.module('mod.home', ['service'])
             * .config(['serviceProvider', function(serviceProvider) {
             *     serviceProvider.setAjaxTimeout({
             *         SHORT     : 2 * 1000,	// 2s, usually for server or login detecting
             *         MID       : 5 * 1000,	// 5s, the default timeout, usually for normal data request
             *         LONG      : 20 * 1000	// 20s, usually for long time request, e.g. big data sending
             *     });
             * }])
             *
             * @memberof serviceProvider
             * @alias setAjaxTimeout
             * @param {object} opts The new options.
             */
            this.setAjaxTimeout = function(opts) {
                angular.extend(serviceConstant.AJAX_TIMEOUT, opts);
                return this;
            }

            /**
             * @description
             * Set go home when something occur?
             *
             * @example
             * angular.module('mod.home', ['service'])
             * .config(['serviceProvider', function(serviceProvider) {
             *     serviceProvider.setGoHomeWhen({
             *         SERVER_DISCONNECT : false,	// should child mod go back home when server disconnected?
             *         SERVER_DISCONNECT_MAX : 3,	// Only when SERVER_DISCONNECT reach max count, then do GO_HOME_WHEN action.
             *         COMMON_ERR        : false,	// should child mod go back home when ajax common error?
             *         KICKED_OUT        : false,	// should child mod go back home when login be kicked out?
             *         TOKEN_ERROR       : false	// should child mod go back home when auth (token) error?
             *     });
             * }])
             *
             * @memberof serviceProvider
             * @alias setGoHomeWhen
             * @param {object} opts The new options.
             */
            this.setGoHomeWhen = function(opts) {
                angular.extend(serviceConstant.GO_HOME_WHEN, opts);
                return this;
            }

            this.$get = function() {
                return serviceConstant;
            }
        }
    ])

    /**
     * @description
     * Log service.
     *
     * This log will add some prefix info before log message.
     *
     * You can modify serviceConstant.LOG_ON to open/close log at compile time.
     *
     * Note: For efficiency, we don't support api to open/close at runtime!
     *
     * @memberof service
     * @ngdoc service
     * @name logService
     * @requires protocolConstant
     * @requires serviceConstant
     * @requires cordova-plugin-console
     * @requires $log
     * @requires $ionicHistory
     */
    .factory('logService', ['protocolConstant', 'serviceConstant', '$log', '$ionicHistory',
        function(protocolConstant, serviceConstant, $log, $ionicHistory) {
            /**
             * @description
             * Write a log message.
             *
             * @memberof logService
             * @param {string} message The log content.
             */
            var log = function(message) {
                //$log.log('[' + protocolConstant.APP.ID + ':logService.$log.log(' + $ionicHistory.currentStateName() + ')] ' + message);
                console.log('[' + protocolConstant.APP.ID + ':logService.console.log(' + $ionicHistory.currentStateName() + ')] ' + message);
            }

            /**
             * @description
             * Write an error message.
             *
             * @memberof logService
             * @param {string} message The log content.
             */
            var error = function(message) {
                //$log.error('[' + protocolConstant.APP.ID + ':logService.$log.error(' + $ionicHistory.currentStateName() + ')] ' + message);
                console.error('[' + protocolConstant.APP.ID + ':logService.console.error(' + $ionicHistory.currentStateName() + ')] ' + message);
            }

            /**
             * @description
             * Write a warning message.
             *
             * @memberof logService
             * @param {string} message The log content.
             */
            var warn = function(message) {
                //$log.warn('[' + protocolConstant.APP.ID + ':logService.$log.warn(' + $ionicHistory.currentStateName() + ')] ' + message);
                console.warn('[' + protocolConstant.APP.ID + ':logService.console.warn(' + $ionicHistory.currentStateName() + ')] ' + message);
            }

            /**
             * @description
             * Write an information message.
             *
             * @memberof logService
             * @param {string} message The log content.
             */
            var info = function(message) {
                //$log.info('[' + protocolConstant.APP.ID + ':logService.$log.info(' + $ionicHistory.currentStateName() + ')] ' + message);
                // As cordova-plugin-console's default log level is WARN, and didn't afford APIs to change log level,
                // so we use higher console.log API to simulate console.info
                console.log('[' + protocolConstant.APP.ID + ':logService.console.info(' + $ionicHistory.currentStateName() + ')] ' + message);
            }

            /**
             * @description
             * Write a debug message.
             *
             * @memberof logService
             * @param {string} message The log content.
             */
            var debug = function(message) {
                //$log.debug('[' + protocolConstant.APP.ID + ':logService.$log.debug(' + $ionicHistory.currentStateName() + ')] ' + message);
                // As cordova-plugin-console's default log level is WARN, and didn't afford APIs to change log level,
                // so we use higher console.log API to simulate console.debug
                console.log('[' + protocolConstant.APP.ID + ':logService.console.debug(' + $ionicHistory.currentStateName() + ')] ' + message);
            }

            var api = {
                log: angular.noop,
                error: angular.noop,
                warn: angular.noop,
                info: angular.noop,
                debug: angular.noop
            }

            if (serviceConstant.LOG_ON) {
                switch (serviceConstant.LOG_LEVEL) {
                    case serviceConstant.LOG_LEVELS.NONE: // the same to `!LOG_ON`
                        break;
                    case serviceConstant.LOG_LEVELS.LOG:
                        api = {
                            log: log,
                            error: angular.noop,
                            warn: angular.noop,
                            info: angular.noop,
                            debug: angular.noop
                        };
                        break;
                    case serviceConstant.LOG_LEVELS.ERROR:
                        api = {
                            log: log,
                            error: error,
                            warn: angular.noop,
                            info: angular.noop,
                            debug: angular.noop
                        };
                        break;
                    case serviceConstant.LOG_LEVELS.WARN:
                        api = {
                            log: log,
                            error: error,
                            warn: warn,
                            info: angular.noop,
                            debug: angular.noop
                        };
                        break;
                    case serviceConstant.LOG_LEVELS.INFO:
                        api = {
                            log: log,
                            error: error,
                            warn: warn,
                            info: info,
                            debug: angular.noop
                        };
                        break;
                    case serviceConstant.LOG_LEVELS.DEBUG:
                        api = {
                            log: log,
                            error: error,
                            warn: warn,
                            info: info,
                            debug: debug
                        };
                        break;
                    default:
                        api = {
                            log: log,
                            error: error,
                            warn: warn,
                            info: angular.noop,
                            debug: angular.noop
                        };
                }
            }

            return api;
        }
    ])

    /**
     * @description
     * Language service.
     *
     * @memberof service
     * @ngdoc service
     * @name languageService
     * @requires $translatePartialLoader
     * @requires $translate
     */
    .factory('languageService', ['$translatePartialLoader', '$translate',
        function($translatePartialLoader, $translate) {
            /**
             * @description
             * Set language to 'zh', 'en'... by hand.
             *
             * @memberof languageService
             * @alias changeLanguage
             * @param {string} lang The language name, e.g. 'zh', 'en'...
             * @returns {string} The new language's name.
             */
            var setLanguage = function(lang) {
                $translate.preferredLanguage(lang);
                $translate.use(lang);
                return $translate.preferredLanguage();
            }

            /*
             * @description
             * Load mod's language file without refresh.
             *
             * WARNING: This won't refresh language.
             *
             * @memberof languageService
             * @param {string} mod The mod name.
             */
            var loadModLanguageNoRefresh = function(mod) {
                // load this mod's i18n file
                $translatePartialLoader.addPart(mod);
            }

            /**
             * @description
             * Load mod's language file.
             *
             * NOTICE: This will refresh language immediately.
             *
             * @memberof languageService
             * @alias loadLanguage
             * @param {string} mod The mod name.
             */
            var loadModLanguage = function(mod) {
                // load this mod's i18n file
                $translatePartialLoader.addPart(mod);
                $translate.refresh();
            }

            /**
             * @description
             * Refresh language immediately.
             *
             * @memberof languageService
             */
            var refreshLanguage = function() {
                $translate.refresh();
            }

            /**
             * @description
             * Get current language name.
             *
             * @memberof languageService
             * @alias getLanguage
             * @returns {string} The current language's name.
             */
            var getCurrentLanguage = function() {
                return $translate.preferredLanguage();
            }

            /**
             * @description
             * Translate one or multiple string.
             *
             * WARNING: This function is asynchronous!
             *
             * @example
             * // General usage
             * translate('NAMESPACE.PARAGRAPH', function(string) {
             *     $scope.namespaced_paragraph = string;
             * });
             *
             * // Variable replacement
             * translate('NAMESPACE.PARAGRAPH', {name:'guest', time:'2016'}, function(string) {
             *     $scope.namespaced_paragraph = string;
             * });
             *
             * // Multiple translation IDs
             * translate(['HEADLINE', 'PARAGRAPH', 'NAMESPACE.PARAGRAPH'], function(string) {
             *     $scope.headline = string.HEADLINE;
             *     $scope.paragraph = string.PARAGRAPH;
             *     $scope.namespaced_paragraph = string['NAMESPACE.PARAGRAPH'];
             * });
             *
             * @memberof languageService
             * @param {array|string} id The array including ids or single string id.
             * @param {object|function} variable The object contains variable for string id, or callback function (refer to arg 3).
             * @param {function} callback The callback function, invoked with new `{array|string} string` after translated.
             */
            var translate = function(id, variable, callback) {
                if (angular.isFunction(variable)) {
                    $translate(id).then(function(string) {
                        variable(string);
                    });
                } else if (angular.isObject(variable) && angular.isFunction(callback)) {
                    $translate(id, variable).then(function(string) {
                        callback(string);
                    });
                } else {
                    // wrong args.
                }
            }

            return {
                setLanguage: setLanguage,
                changeLanguage: setLanguage, // alias
                loadModLanguageNoRefresh: loadModLanguageNoRefresh,
                loadModLanguage: loadModLanguage,
                loadLanguage: loadModLanguage, // alias
                refreshLanguage: refreshLanguage,
                getCurrentLanguage: getCurrentLanguage,
                getLanguage: getCurrentLanguage, // alias
                translate: translate
            }
        }
    ])

    /**
     * @description
     * Link (Router) service.
     *
     * @memberof service
     * @ngdoc service
     * @name linkService
     * @requires serviceConstant
     * @requires logService
     * @requires authInfoService
     * @requires $state
     * @requires $stateParams
     * @requires $ionicHistory
     * @requires $ionicPlatform
     * @requires $rootScope
     */
    .factory('linkService', ['serviceConstant', 'logService', 'authInfoService', '$state', '$stateParams', '$ionicHistory', '$ionicPlatform', '$rootScope',
        function(serviceConstant, logService, authInfoService, $state, $stateParams, $ionicHistory, $ionicPlatform, $rootScope) {
            var backupData = {};
            var skipLoginCount = 0;
            var goBackInjector = null;

            var getSkipLoginCount = function() {
                return skipLoginCount;
            }

            var setSkipLoginCount = function(number) {
                skipLoginCount = number;
            }

            var skipLoginCountPlusOne = function() {
                skipLoginCount++;
            }

            var skipLoginCountMinusOne = function() {
                skipLoginCount--;
                if (skipLoginCount < 0) {
                    skipLoginCount = 0;
                }
            }

            /**
             * @description
             * Prevent any auto jump to home when (network or auth) error occurs.
             *
             * This is used to make some special mod (e.g. 'introduce') happy. If error occurs, won't auto jump to home mod.
             *
             * Remember to do allowAutoJumpWhenError() later as partners.
             *
             * @memberof linkService
             */
            var preventAutoJumpWhenError = function() {
                if (backupData.GO_HOME_WHEN) {
                    // forgot to do allow* before, do nothing and just return, because all tags are `false`.
                    return;
                } else {
                    backupData.GO_HOME_WHEN = {};
                    backupData.GO_HOME_WHEN.SERVER_DISCONNECT = serviceConstant.GO_HOME_WHEN.SERVER_DISCONNECT;
                    serviceConstant.GO_HOME_WHEN.SERVER_DISCONNECT = false;
                    backupData.GO_HOME_WHEN.COMMON_ERR = serviceConstant.GO_HOME_WHEN.COMMON_ERR;
                    serviceConstant.GO_HOME_WHEN.COMMON_ERR = false;
                    backupData.GO_HOME_WHEN.KICKED_OUT = serviceConstant.GO_HOME_WHEN.KICKED_OUT;
                    serviceConstant.GO_HOME_WHEN.KICKED_OUT = false;
                    backupData.GO_HOME_WHEN.TOKEN_ERROR = serviceConstant.GO_HOME_WHEN.TOKEN_ERROR;
                    serviceConstant.GO_HOME_WHEN.TOKEN_ERROR = false;
                }
            }

            /**
             * @description
             * Allow auto jump to home when (network or auth) error occurs. This is used to be pairing to preventAutoJumpWhenError().
             *
             * Refer to serviceProvider.setGoHomeWhen() for specific define in config phase.
             *
             * @memberof linkService
             */
            var allowAutoJumpWhenError = function() {
                if (backupData.GO_HOME_WHEN) {
                    serviceConstant.GO_HOME_WHEN.SERVER_DISCONNECT = backupData.GO_HOME_WHEN.SERVER_DISCONNECT;
                    serviceConstant.GO_HOME_WHEN.COMMON_ERR = backupData.GO_HOME_WHEN.COMMON_ERR;
                    serviceConstant.GO_HOME_WHEN.KICKED_OUT = backupData.GO_HOME_WHEN.KICKED_OUT;
                    serviceConstant.GO_HOME_WHEN.TOKEN_ERROR = backupData.GO_HOME_WHEN.TOKEN_ERROR;
                    delete backupData.GO_HOME_WHEN;
                } else {
                    // already do allow* before, just return.
                    return;
                }
            }

            /**
             * @description
             * Get the current mod's name.
             *
             * @memberof linkService
             * @returns {string} the current mod's name.
             */
            var getCurrentModName = function() {
                return $ionicHistory.currentStateName().split('.')[0].split('-')[0];
            }

            /*
             * @description
             * Is at home?
             *
             * @memberof linkService
             * @returns {boolean} Is at home now?
             */
            var isHome = function() {
                return (getCurrentModName() == serviceConstant.MOD.HOME);
            }

            /**
             * @description
             * Go to one mod/state.
             *
             * Refer to http://angular-ui.github.io/ui-router/site/#/api/ui.router.state.$state
             *
             * @memberof linkService
             * @param {string} mod To mod/state name.
             * @param {object} params A map of the parameters that will be sent to the mod/state, will populate $stateParams.
             * @param {object} options Options object.
             * @param {function} fallback The fallback function, invoked with arg `{string} mod/state` if gotoMod failed.
             */
            var gotoMod = function(mod, params, options, fallback) {
                if ($state.get(mod)) {
                    $state.go(mod, params, options);
                } else {
                    logService.warn("linkService.gotoMod: state(" + mod + ") doesn't exist! Jump won't occur.");
                    if (angular.isFunction(fallback)) {
                        fallback(mod);
                    }
                }
            }

            /**
             * @description
             * Go to home mod/state.
             *
             * This api is deprecated as router stack trap, don't use it anymore. Use `goBackHome` instead.
             *
             * @memberof linkService
             * @deprecated
             * @param {object} params A map of the parameters that will be sent to the mod/state, will populate $stateParams.
             * @param {object} options Options object.
             * @param {function} fallback The fallback function, invoked with arg `{string} mod/state` if failed.
             */
            var gotoHome = function(params, options, fallback) {
                gotoMod(serviceConstant.MOD.HOME, params, options, fallback);
            }

            /**
             * @description
             * Go to login mod/state.
             *
             * @memberof linkService
             * @param {object} params A map of the parameters that will be sent to the mod/state, will populate $stateParams.
             * @param {object} options Options object.
             * @param {function} fallback The fallback function, invoked with arg `{string} mod/state` if gotoLogin failed.
             */
            var gotoLogin = function(params, options, fallback) {
                gotoMod(serviceConstant.MOD.LOGIN, params, options, fallback);
            }

            /**
             * @description
             * Get the fromState's $stateParams.
             *
             * Refer to http://angular-ui.github.io/ui-router/site/#/api/ui.router.state.$state
             *
             * Please notice the state parent-child tree will affect the params inheritance.
             *
             * @memberof linkService
             * @returns {object} The $stateParams object.
             */
            var getModParams = function() {
                return $stateParams;
            }

            /**
             * @description
             * Go back to the front mod/state.
             *
             * @memberof linkService
             * @param {number|undefined} backCount Optional negative integer setting how many views to go
             * back. By default, if user have login, it'll go back one view by using the value `-1`.
             * if user not login, it'll go back two views by using the value `-2`.
             * You can also specify the value explicitly, but be sure you have catch the theory of router before!
             * To go back two views you would use `-2`. If the number goes farther back than the number of views
             * in the current history's stack then it'll go to the first view in the current history's stack.
             * If the number is zero or greater then it'll do the default action. It also does not
             * cross history stacks, meaning it can only go as far back as the current history.
             */
            var _goBack = function(backCount) {
                if (isHome()) {
                    ionic.Platform.exitApp();
                    return;
                }
                if (backCount && angular.isNumber(backCount) && backCount < -1) {
                    $ionicHistory.goBack(backCount);
                } else {
                    if (getSkipLoginCount() > 0 || authInfoService.isLogin()) {
                        // NOTE: skipLoginCount allow us to route like below:
                        // ```
                        // Home (isLogin:false)
                        // | go     ^
                        // v        | goBack
                        // Mod1/State1 (isLogin:false, skipLogin:true)
                        // | go     ^
                        // v        | goBack
                        // Mod2/State2 (isLogin:false, skipLogin:true)
                        // ```
                        skipLoginCountMinusOne();
                        $ionicHistory.goBack();
                    } else {
                        // NOTE: This is a router trick!
                        // - If user do jump: `home -> login -(not login surely, click cancel, back to)-> home`,
                        //   `goBack()` will back one time, like we wish.
                        // - If user do jump: `home -> child -(not login, redirect to)-> login -(cancel, back to)-> home`,
                        //   `goBack(-2)` will back two times, and it's always `home` as our App design for mod jump.
                        $ionicHistory.goBack(-2);
                    }
                }
            }

            /**
             * @description
             * Go back to the front mod/state.
             *
             * What's the difference between `goBack` and `_goBack`:
             * - `_goBack` is the real implementing of go back action. You can access it to get the original go back action if `goBack` has been modified.
             * - `goBack` is based on `_goBack`, and can be modified by `registerBackButtonAction`. You should always like to use `goBack` instead of `_goBack`.
             *
             * @memberof linkService
             * @param {number|undefined} backCount Optional negative integer setting how many views to go
             * back. By default, if user have login, it'll go back one view by using the value `-1`.
             * if user not login, it'll go back two views by using the value `-2`.
             * You can also specify the value explicitly, but be sure you have catch the theory of router before!
             * To go back two views you would use `-2`. If the number goes farther back than the number of views
             * in the current history's stack then it'll go to the first view in the current history's stack.
             * If the number is zero or greater then it'll do the default action. It also does not
             * cross history stacks, meaning it can only go as far back as the current history.
             */
            var goBack = function(backCount) {
                if (angular.isFunction(goBackInjector)) {
                    goBackInjector(backCount);
                } else {
                    _goBack(backCount);
                }
            }

            /**
             * @description
             * Go back home mod/state (all middle states will be destroyed).
             *
             * @memberof linkService
             */
            var goBackHome = function() {
                if (window.StatusBar && !StatusBar.isVisible) {
                    StatusBar.show();
                }
                if (!isHome()) {
                    // try to go back to the first/root state (`-100` is large enough), and the probability is home mod/state.
                    _goBack(-100);
                    // for safe
                    gotoMod(serviceConstant.MOD.HOME);
                }
            }

            /**
             * @description
             * Register a software (nav header) and hardware (Android) back button action.
             *
             * WARNING: It will override the default `linkService.goBack` action. Use `unregisterBackButtonAction` to restore.
             *
             * Note for hardware back button:
             * By default, it will do an action assigned a priority of 101, which will override the 'return to
             * previous view' action, but not any of the other actions.
             * Refer to http://ionicframework.com/docs/api/service/$ionicPlatform/
             *
             * @memberof linkService
             * @param {function} callback Called when the back button is pressed, if this listener is the highest priority.
             * @param {number|undefined} priority Only the highest priority will execute. Default is 101.
             */
            var registerBackButtonAction = function(callback, priority) {
                // unregister original hardware back button and register new one
                $ionicPlatform.offHardwareBackButton(_goBack);
                var p = 101;
                if (angular.isNumber(priority)) {
                    p = priority;
                }
                $ionicPlatform.registerBackButtonAction(callback, p);
                // register new software back button
                goBackInjector = callback;
            }

            /**
             * @description
             * Unregister a software (nav header) and hardware (Android) back button action.
             *
             * @memberof linkService
             * @param {function} callback The callback to trigger when this event occurs.
             */
            var unregisterBackButtonAction = function(callback) {
                // restore original hardware back button
                $ionicPlatform.offHardwareBackButton(callback);
                $ionicPlatform.registerBackButtonAction(_goBack, 101);
                // restore original software back button
                goBackInjector = null;
            }

            $rootScope.$on('$ionicView.loaded', function() {
                logService.debug('linkService: event: $ionicView.loaded');
            });
            $rootScope.$on('$ionicView.beforeEnter', function() {
                logService.debug('linkService: event: $ionicView.beforeEnter');
            });
            $rootScope.$on('$ionicView.enter', function() {
                logService.debug('linkService: event: $ionicView.enter');
            });
            $rootScope.$on('$ionicView.afterEnter', function() {
                logService.debug('linkService: event: $ionicView.afterEnter');
            });
            $rootScope.$on('$ionicView.beforeLeave', function() {
                logService.debug('linkService: event: $ionicView.beforeLeave');
            });
            $rootScope.$on('$ionicView.leave', function() {
                logService.debug('linkService: event: $ionicView.leave');
            });
            $rootScope.$on('$ionicView.afterLeave', function() {
                logService.debug('linkService: event: $ionicView.afterLeave');
            });
            $rootScope.$on('$ionicView.unloaded', function() {
                logService.debug('linkService: event: $ionicView.unloaded');
            });
            document.addEventListener('pause', function() {
                logService.debug('linkService: event: app/page pause');
            }, false);
            document.addEventListener('resume', function() {
                logService.debug('linkService: event: app/page resume');
            }, false);

            return {
                getSkipLoginCount: getSkipLoginCount,
                setSkipLoginCount: setSkipLoginCount,
                skipLoginCountPlusOne: skipLoginCountPlusOne,
                skipLoginCountMinusOne: skipLoginCountMinusOne,
                preventAutoJumpWhenError: preventAutoJumpWhenError,
                allowAutoJumpWhenError: allowAutoJumpWhenError,
                getCurrentModName: getCurrentModName,
                isHome: isHome,
                _goBack: _goBack,
                goBack: goBack,
                goBackHome: goBackHome,
                gotoMod: gotoMod,
                gotoHome: gotoHome,
                gotoLogin: gotoLogin,
                getModParams: getModParams,
                registerBackButtonAction: registerBackButtonAction,
                unregisterBackButtonAction: unregisterBackButtonAction
            }
        }
    ])

    /**
     * @description
     * Http service.
     *
     * @memberof service
     * @ngdoc service
     * @name httpService
     * @requires logService
     * @requires $http
     */
    .factory('httpService', ['logService', '$http',
        function(logService, $http) {
            /**
             * @description
             * Get one file's data by http url.
             *
             * @memberof httpService
             * @param {string} url The file's url.
             * @param {object|undefined} config The config for request.
             * @param {function} successCallback The callback function, invoked with arg `{object|string} data` after file data gotten.
             * @param {function} failCallback The callback function, invoked after fail.
             */
            var get = function(url, config, successCallback, failCallback) {
                $http.get(url, config)
                    .success(function(data, status, headers, config, statusText) {
                        if (angular.isString(data)) {
                            try {
                                // try to convert from json string to object
                                data = angular.fromJson(data);
                            } catch (err) {
                                // if not a json string, do nothing
                                logService.debug('httpService.get: can not convert data from json string to object. maybe it is just text string.');
                            }
                        }
                        if (angular.isFunction(successCallback)) {
                            successCallback(data);
                        }
                    })
                    .error(function(data, status, headers, config, statusText) {
                        if (angular.isFunction(failCallback)) {
                            failCallback();
                        }
                    })
            }

            /**
             * @description
             * Post data to one http url, and get response data.
             *
             * @memberof httpService
             * @param {string} url The url which wants data.
             * @param {object|string} data The data (string or json object) to be sent.
             * @param {object|undefined} config The config for request.
             * @param {function} successCallback The callback function, invoked with arg `{object|string} data` after response data gotten.
             * @param {function} failCallback The callback function, invoked after fail.
             */
            var post = function(url, data, config, successCallback, failCallback) {
                if (angular.isObject(data)) {
                    // convert to json string
                    try {
                        data = angular.toJson(data);
                    } catch (err) {
                        data = '' + data;
                    }
                } else {
                    // convert to string
                    data = '' + data;
                }
                $http.post(url, data, config)
                    .success(function(data, status, headers, config, statusText) {
                        if (angular.isString(data)) {
                            try {
                                // try to convert from json string to object
                                data = angular.fromJson(data);
                            } catch (err) {
                                // if not a json string, do nothing
                                logService.warn('httpService.post: can not convert data from json string to object');
                            }
                        }
                        if (angular.isFunction(successCallback)) {
                            successCallback(data);
                        }
                    })
                    .error(function(data, status, headers, config, statusText) {
                        if (angular.isFunction(failCallback)) {
                            failCallback();
                        }
                    });
            }

            return {
                get: get,
                post: post
            }
        }
    ])

    /**
     * @description
     * Mod service.
     *
     * @memberof service
     * @ngdoc service
     * @name modService
     * @requires serviceConstant
     * @requires serviceValue
     * @requires httpService
     * @requires logService
     * @requires languageService
     * @requires linkService
     * @requires authInfoService
     * @requires promptService
     * @requires $ocLazyLoad
     * @requires $rootScope
     * @requires $timeout
     */
    .factory('modService', ['serviceConstant', 'serviceValue', 'httpService', 'logService', 'languageService', 'linkService', 'authInfoService', 'promptService', '$ocLazyLoad', '$rootScope', '$timeout',
        function(serviceConstant, serviceValue, httpService, logService, languageService, linkService, authInfoService, promptService, $ocLazyLoad, $rootScope, $timeout) {
            /*
             * @description
             * Get one file's data by url.
             *
             * @memberof modService
             * @private
             * @param {string} url The file's url.
             * @param {function} callback The callback function, invoked with arg `{object} data` after file gotten.
             */
            var get = function(url, callback) {
                httpService.get(url, {
                    ignoreLoadingBar: true
                }, callback, function() {
                    logService.error('modService.get(' + url + '): fail to get mod file!');
                });
            }

            /**
             * @description
             * Get one mod file's data by mod name, based on `get`.
             *
             * @memberof modService
             * @param {string} mod The mod name.
             * @param {string} file The file name.
             * @param {function} callback The callback function, invoked with arg `{object} data` after file gotten.
             */
            var getModFile = function(mod, file, callback) {
                if (mod) {
                    get(serviceConstant.MOD.PATH + "/" + mod + "/" + file, callback);
                } else {
                    get(serviceConstant.MOD.PATH + "/" + file, callback);
                }
            }

            /**
             * @description
             * Get mod's entry/configuration, based on `getModFile`.
             *
             * @memberof modService
             * @alias getModInfo
             * @param {string} mod The mod name.
             * @param {function} callback The callback function, invoked with arg `{json-object} data` after file gotten.
             */
            var getModEntry = function(mod, callback) {
                getModFile(mod, serviceConstant.MOD.ENTRY, callback);
            }

            /**
             * @description
             * Get mod's html, based on `getModFile`.
             *
             * @memberof modService
             * @param {string} mod The mod name.
             * @param {function} callback The callback function, invoked with arg `{object} data` after file gotten.
             */
            var getModHtml = function(mod, callback) {
                getModFile(mod, serviceConstant.MOD.HTML, callback);
            }

            /**
             * @description
             * Get mod's js, based on `getModFile`.
             *
             * @memberof modService
             * @param {string} mod The mod name.
             * @param {function} callback The callback function, invoked with arg `{object} data` after file gotten.
             */
            var getModJs = function(mod, callback) {
                getModFile(mod, serviceConstant.MOD.JS, callback);
            }

            /**
             * @description
             * Get mod's image url, not image file.
             *
             * @memberof modService
             * @param {string} imgName The image name.
             * @param {string|undefined} mod The mod name. If `undefined`, will get the current mod's image url by default.
             */
            var getModImgUrl = function(imgName, mod) {
                if (mod) {
                    return serviceConstant.MOD.PATH + "/" + mod + "/" + serviceConstant.MOD.IMG_PATH + "/" + imgName;
                } else {
                    var modName = linkService.getCurrentModName();
                    return serviceConstant.MOD.PATH + "/" + modName + "/" + serviceConstant.MOD.IMG_PATH + "/" + imgName;
                }
            }

            /**
             * @description
             * Load mod files (css, js, i18n...) on the fly and insert to angular module dependency.
             *
             * @memberof modService
             * @private
             * @param {array} mod The array contain mod(s) name.
             */
            var loadMods = function(mod) {
                for (var i in mod) {
                    $ocLazyLoad.load(serviceConstant.MOD.PATH + "/" + mod[i] + "/" + serviceConstant.MOD.CSS);
                    $ocLazyLoad.load(serviceConstant.MOD.PATH + "/" + mod[i] + "/" + serviceConstant.MOD.JS);
                    languageService.loadModLanguageNoRefresh(mod[i]);
                }
                languageService.refreshLanguage();
            }

            /*
             * @description
             * Init home mod's menus.
             *
             * @memberof modService
             * @private
             * @param {object} modInfo mod's entry object.
             */
            var initMenus = function(modInfo, homeInfo) {
                serviceValue.menus = {
                    sideMenus: [],
                    gridMenus: []
                };
                if (!modInfo || !modInfo.entry || !modInfo.entry.childMods) {
                    logService.warn("modService.initMenus: No childMods found.");
                    return;
                }
                // do action one by one
                var i = 0;
                async.whilst(
                    function() {
                        return i < modInfo.entry.childMods.length;
                    },
                    function(callback) {
                        getModEntry(modInfo.entry.childMods[i], function(childModInfo) {
                            // amend childModInfo: add menu jump link using its mod name
                            childModInfo.entry.link = childModInfo.mod;
                            childModInfo.entry.icon = getModImgUrl(childModInfo.mod + '.png', childModInfo.mod);
                            childModInfo.entry.title = childModInfo.mod.toUpperCase() + '.TITLE';
                            if (childModInfo.entry.location === "sideMenu" && homeInfo.entry.supportLocation.indexOf("sideMenu") > -1) {
                                serviceValue.menus.sideMenus.push(childModInfo.entry);
                            } else if (childModInfo.entry.location === "gridMenu" && homeInfo.entry.supportLocation.indexOf("gridMenu") > -1) {
                                serviceValue.menus.gridMenus.push(childModInfo.entry);
                            } else if (childModInfo.entry.location === "hide" && homeInfo.entry.supportLocation.indexOf("hide") > -1) {
                                // "hide", don't process
                                //logService.debug("modService.initMenus: mod(" + childModInfo.mod + ") wants entry(hide), needs no process.");
                            } else if (childModInfo.entry.location === "home" && homeInfo.entry.supportLocation.indexOf("home") > -1) {
                                // "home", don't process
                                //logService.debug("modService.initMenus: mod(" + childModInfo.mod + ") wants entry(home), needs no process.");
                            } else {
                                logService.warn("modService.initMenus: mod(" + childModInfo.mod + ") wants entry(" + childModInfo.entry.location + "), but is not supported now!");
                            }
                            i++;
                            callback(null, i);
                        });
                    },
                    function(err, n) {
                        return;
                    }
                );
            }

            /**
             * @description
             * This is a bundle to init router, language, menus, home and child mods...
             *
             * @memberof modService
             * @param {function} callback The callback function, (always) invoked after init.
             */
            var initMods = function(callback) {
                getModEntry(null, function(modInfo) {
                    if (!modInfo || !modInfo.mod) {
                        logService.error("modService.initMods: no mod afforded.");
                        return;
                    }
                    getModEntry(serviceConstant.MOD.HOME, function(homeInfo) {
                        if (!homeInfo || !homeInfo.mod) {
                            logService.error("modService.initMods: no home afforded.");
                            return;
                        }

                        // Register (hardware and software) back button action.
                        linkService.registerBackButtonAction(linkService._goBack);

                        // When home mod loaded, jump to it.
                        $rootScope.$on('ocLazyLoad.moduleLoaded', function(e, module) {
                            //logService.debug('ocLazyLoad.moduleLoaded: ' + module);
                            if (module.split('.').slice(-1) == serviceConstant.MOD.HOME) {
                                // load (home's) language needs some time.
                                $timeout(linkService.gotoHome, 200);
                            }
                        });

                        // Load child mod's file (css, js, i18n...), and insert to angular module dependency.
                        // e.g. js, css, html (ng-template) files...
                        loadMods(modInfo.entry.coreMods.concat(modInfo.entry.childMods));

                        // Init home mod's menus.
                        $timeout(function() {
                            initMenus(modInfo, homeInfo);
                        }, 200); // a little timeout to ensure loadMods finished

                        if (angular.isFunction(callback)) {
                            callback();
                        }
                    });
                });
            }

            /**
             * @description
             * Init mod.
             *
             * This is a bundle to init mod.
             *
             * @example
             * initMod($scope, {
             *     loaded: loadedCallback,
             *     beforeEnter: beforeEnterCallback,
             *     enter: enterCallback,
             *     afterEnter: afterEnterCallback,
             *     beforeLeave: beforeLeaveCallback,
             *     leave: leaveCallback,
             *     afterLeave: afterLeaveCallback,
             *     unloaded: unloadedCallback, // The same to event `$scope.$on('$destroy', destroyCallback);`
             *     pause: pauseCallback,
             *     resume: resumeCallback
             * });
             *
             * WARNING about `pause` and `resume`:
             * - In the pause handler, any calls to the Cordova API or to native plugins that go through Objective-C do not work,
             *   along with any interactive calls, such as alerts or console.log(). They are only processed when the app resumes, on the next run loop.
             *   Refer to http://cordova.apache.org/docs/en/5.1.1/cordova/events/events.pause.html
             * - When called from a resume event handler, interactive functions such as alert() need to be wrapped in a setTimeout() call with a timeout value of zero, or else the app hangs.
             *   Refer to http://cordova.apache.org/docs/en/5.1.1/cordova/events/events.resume.html
             *
             * @memberof modService
             * @param {object} $scope mod's $scope.
             * @param {object|undefined} callbacks The object contains callback functions of View LifeCycle and Events, Refer to [ionView](http://ionicframework.com/docs/api/directive/ionView/).
             * WARNING: As asynchronous, some too closed callback will not be triggered by order as we wish.
             * @param {boolean|undefined} skipLogin The mod could skip login? If `true`, won't check login; else check login, and if not login, will redirect to login mod.
             */
            var initMod = function($scope, callbacks, skipLogin) {
                var curModName = linkService.getCurrentModName();
                if (skipLogin && curModName != serviceConstant.MOD.LOGIN && curModName != serviceConstant.MOD.HOME) {
                    linkService.skipLoginCountPlusOne();
                }
                $scope.$on('$ionicView.beforeEnter', function() {
                    if (!skipLogin && !authInfoService.isLogin()) {
                        promptService.toast.info('COMMON.CONTENT.LOGIN_REQUIRED');
                        linkService.gotoLogin();
                        return;
                    }
                });

                if (callbacks) {
                    if (angular.isFunction(callbacks.loaded)) {
                        $scope.$on('$ionicView.loaded', function() {
                            callbacks.loaded();
                        });
                    }
                    if (angular.isFunction(callbacks.beforeEnter)) {
                        $scope.$on('$ionicView.beforeEnter', function() {
                            callbacks.beforeEnter();
                        });
                    }
                    if (angular.isFunction(callbacks.enter)) {
                        $scope.$on('$ionicView.enter', function() {
                            callbacks.enter();
                        });
                    }
                    if (angular.isFunction(callbacks.afterEnter)) {
                        $scope.$on('$ionicView.afterEnter', function() {
                            callbacks.afterEnter();
                        });
                    }
                    if (angular.isFunction(callbacks.beforeLeave)) {
                        $scope.$on('$ionicView.beforeLeave', function() {
                            callbacks.beforeLeave();
                        });
                    }
                    if (angular.isFunction(callbacks.leave)) {
                        $scope.$on('$ionicView.leave', function() {
                            callbacks.leave();
                        });
                    }
                    if (angular.isFunction(callbacks.afterLeave)) {
                        $scope.$on('$ionicView.afterLeave', function() {
                            callbacks.afterLeave();
                        });
                    }
                    if (angular.isFunction(callbacks.unloaded)) {
                        $scope.$on('$ionicView.unloaded', function() {
                            callbacks.unloaded();
                        });
                    }
                    if (angular.isFunction(callbacks.pause)) {
                        document.addEventListener('pause', function() {
                            callbacks.pause();
                        }, false);
                    }
                    if (angular.isFunction(callbacks.resume)) {
                        document.addEventListener('resume', function() {
                            $timeout(callbacks.resume, 0);
                        }, false);
                    }
                }
            }

            return {
                getModFile: getModFile,
                getModEntry: getModEntry,
                getModInfo: getModEntry, // alias
                getModHtml: getModHtml,
                getModJs: getModJs,
                getModImgUrl: getModImgUrl,
                initMods: initMods,
                initMod: initMod
            }
        }
    ])

    /**
     * @description
     * Auth info management service.
     *
     * @memberof service
     * @ngdoc service
     * @name authInfoService
     * @requires serviceValue
     * @requires localDataService
     */
    .factory('authInfoService', ['serviceValue', 'localDataService',
        function(serviceValue, localDataService) {
            /*
             * @description
             * Mark login status.
             *
             * @memberof authInfoService
             * @private
             * @param {boolean} isLogin We have login?
             */
            var markLogin = function(isLogin) {
                serviceValue.isLogin = (isLogin ? true : false);
            }

            /*
             * @description
             * Get the marked login status.
             *
             * @memberof authInfoService
             * @private
             * @returns {boolean} We have login?
             */
            var isLogin = function() {
                return serviceValue.isLogin ? true : false;
            }

            /**
             * @description
             * Get (token) from local storage.
             *
             * @memberof authInfoService
             * @returns {string} The token string.
             */
            var get = function() {
                return localDataService.getDevice('token');
            }

            /**
             * @description
             * Set (token) to save in local storage.
             *
             * @memberof authInfoService
             * @param {string} token The token string.
             */
            var set = function(token) {
                localDataService.setDevice('token', token);
            }

            /**
             * @description
             * Clear (token) in local storage.
             *
             * @memberof authInfoService
             * @param {string} token The token string.
             */
            var clear = function() {
                localDataService.clearDevice('token');
            }

            return {
                markLogin: markLogin,
                isLogin: isLogin,
                get: get,
                set: set,
                clear: clear
            }
        }
    ])

    /**
     * @description
     * Auth (login, logout...) service.
     *
     * @memberof service
     * @ngdoc service
     * @name authService
     * @requires serviceConstant
     * @requires logService
     * @requires linkService
     * @requires serverDataService
     * @requires authInfoService
     * @requires $window
     */
    .factory('authService', ['serviceConstant', 'serviceValue', 'logService', 'linkService', 'serverDataService', 'authInfoService', '$window',
        function(serviceConstant, serviceValue, logService, linkService, serverDataService, authInfoService, $window) {
            /**
             * @description
             * Login action.
             *
             * @memberof authService
             * @param {string} username The username string.
             * @param {string} password The password string.
             * @param {function} callback The callback function, invoked with arg `{json-object} data` and `{boolean} isLogin` after try login.
             */
            var login = function(username, password, callback) {
                var loginCallback = callback;

                // read password from user or from service.auth if need
                if (!username || !password) {
                    logService.error('authService.login: username or password is blank!');
                    authInfoService.markLogin(false);
                    if (angular.isFunction(loginCallback)) {
                        loginCallback(undefined, false);
                    }
                    return;
                }

                // for TEST
                //serverDataService.request({
                var isLogin = true;
                var data = null;
                authInfoService.set('tokenxxx');
                authInfoService.markLogin(isLogin);
                if (angular.isFunction(loginCallback)) {
                    loginCallback(data, isLogin);
                }
            }

            /**
             * @description
             * Logout action.
             *
             * WARNING: As we are going to redirect to home page, so the callback maybe won't be invoked in good time!
             *
             * @memberof authService
             * @param {function} callback The callback function, invoked with arg `{json-object} data` and `{boolean} isLogout` after logout always.
             */
            var logout = function(callback) {
                var isLogout = false;
                var logoutCallback = callback;

                // for TEST
                //serverDataService.request({
                isLogout = true;
                var data = null;
                if (angular.isFunction(logoutCallback)) {
                    logoutCallback(data, isLogout);
                }

                // no matter result, always clear auth info
                authInfoService.clear();
                authInfoService.markLogin(false);

                // and redirect to home page (if not at home now) by default
                // As service doesn't know route/state, so just redirect using low API.
                if (!linkService.isHome()) {
                    $window.location.href = serviceConstant.HOME_PATH;
                }
            }

            /**
             * @description
             * Check if have login.
             *
             * @memberof authService
             * @param {function} callback The callback function, invoked with arg `{json-object} data` and `{boolean} isLogin` after check.
             */
            var checkLogin = function(callback) {
                var isLogin = false;
                var checkCallback = callback;

                // for TEST
                //serverDataService.request({
                isLogin = true;
                var data = null;
                authInfoService.markLogin(isLogin);
                if (angular.isFunction(checkCallback)) {
                    checkCallback(data, isLogin);
                }
            }

            /**
             * @description
             * Check attempt action.
             *
             * Check the remain attempts for login.
             *
             * WARNING: The result may be `undefined` if request fail, but this API don't care it. So the invoker should judge result before use it.
             *
             * @memberof authService
             * @param {function} callback The callback function, invoked with arg `{json-object} data` after check.
             */
            var checkAttempt = function(callback) {
                var checkAttemptCallback = callback;

                // for TEST
                //serverDataService.request({
                var data = null;
                if (angular.isFunction(checkAttemptCallback)) {
                    checkAttemptCallback(data);
                }
            }

            /**
             * @description
             * Check if the user is an newcomer, not a register.
             *
             * We will get and set a default token automatically.
             *
             * @memberof authService
             * @param {function} callback The callback function, invoked with arg `{json-object} data` and `{boolean} isNewcomer` after check.
             */
            var checkNewcomer = function(callback) {
                var isNewcomer = false;
                var checkCallback = callback;

                // for TEST
                //serverDataService.request({
                isNewcomer = true;
                var data = null;
                if (angular.isFunction(checkCallback)) {
                    checkCallback(data, isNewcomer);
                }
            }

            /**
             * @description
             * Update username and password.
             *
             * @memberof authService
             * @param {string} oldUsername The old username.
             * @param {string} newUsername The new username you want to set.
             * @param {string} oldPassword The old password.
             * @param {string} newPassword The new password you want to set.
             * @param {function} callback The callback function, invoked with arg `{json-object} data` and `{boolean} isUpdateSuccess` after set.
             */
            var updateAccount = function(oldUsername, newUsername, oldPassword, newPassword, callback) {
                var isUpdateSuccess = false;

                // for TEST
                //serverDataService.request({
                isUpdateSuccess = true;
                var data = null;
                if (angular.isFunction(callback)) {
                    callback(data, isUpdateSuccess);
                }
            }

            /**
             * @description
             * If an newcomer, we could login using default PASSWORD.
             *
             * @memberof authService
             * @alias newcomer.login
             * @param {function} callback The callback function, invoked with arg `{json-object} data` and `{boolean} isLogin` after try login.
             */
            var newcomerLogin = function(callback) {
                login(serviceConstant.DEFAULT_LOGIN_ACCOUNT.PASSWORD, callback);
            }

            /**
             * @description
             * If an newcomer, we could set new password using default PASSWORD.
             *
             * @memberof authService
             * @alias newcomer.register
             * @param {string} newUsername The new username you want to set.
             * @param {string} newPassword The new password you want to set.
             * @param {function} callback The callback function, invoked with arg `{json-object} data` and `{boolean} isUpdateSuccess` after set.
             */
            var register = function(newUsername, newPassword, callback) {
                updateAccount(serviceConstant.DEFAULT_LOGIN_ACCOUNT.USERNAME, newUsername, serviceConstant.DEFAULT_LOGIN_ACCOUNT.PASSWORD, newPassword, callback);
            }

            return {
                login: login,
                logout: logout,
                checkLogin: checkLogin,
                checkAttempt: checkAttempt,
                checkNewcomer: checkNewcomer,
                updateAccount: updateAccount,
                newcomer: {
                    login: newcomerLogin,
                    register: register
                }
            }
        }
    ])

    /**
     * @description
     * Server data (json) request service.
     *
     * @memberof service
     * @ngdoc service
     * @name serverDataService
     * @requires serviceConstant
     * @requires serviceValue
     * @requires httpService
     * @requires logService
     * @requires localDataService
     * @requires authInfoService
     * @requires linkService
     * @requires promptService
     */
    .factory('serverDataService', ['serviceConstant', 'serviceValue', 'httpService', 'logService', 'localDataService', 'authInfoService', 'linkService', 'promptService',
        function(serviceConstant, serviceValue, httpService, logService, localDataService, authInfoService, linkService, promptService) {
            /**
             * @description
             * Request action.
             *
             * Note: If you request cross-domain data in browser, two requests will be tried.
             * First `http:Method:OPTIONS` request will use default timeout,
             * and if it failed, second `http:Method:POST` data request won't be sent.
             *
             * @example
             * // Get action
             * serverDataService.request({
             *     ignoreLoadingBar: false,
             *     module: 'status',
             *     action: 0,
             *     callback: updateView.status
             * });
             *
             * // Set action
             * serverDataService.request({
             *     ignoreLoadingBar: true,
             *     module: 'child',
             *     action: 1,
             *     data: $scope.data.child,
             *     callback: requestData
             * });
             *
             * @memberof serverDataService
             * @param {object} opts The config for request.
             */
            var request = function(opts) {
                var httpServer = 'http://' + serviceValue.serverAddress;
                var config = {
                    ignoreLoadingBar: opts.ignoreLoadingBar,
                    url: httpServer,
                    // ajax timeout
                    timeout: serviceConstant.AJAX_TIMEOUT.MID
                };

                // invoker can custom ajax timeout
                if (opts.timeout && angular.isNumber(opts.timeout)) {
                    config.timeout = opts.timeout;
                }

                var module = opts.module,
                    action = opts.action,
                    data = opts.data;

                var url = config.url + '/' + (module === serviceConstant.SERVER_INFO.AUTH_MODULE ? serviceConstant.SERVER_INFO.AUTH_CGI : serviceConstant.SERVER_INFO.WEB_CGI);
                var jsonObj = angular.extend({
                    module: module,
                    action: action
                }, data);

                // Add Token to ajax data:
                // 1. Web module doesn't need token, except for action KEEP_ALIVE and UNSET_DEFAULT
                // 2. Auth module doesn't need token, except for action CLOSE and UPDATE
                // 3. Status module: don't pass token if no token, but if we have token we must pass token
                //      since IMEI and MEID is returned only when token is carried
                if ((module === serviceConstant.SERVER_INFO.WEB_MODULE && (action === serviceConstant.AJAX_ACTION.KEEP_ALIVE || action === serviceConstant.AJAX_ACTION.UNSET_DEFAULT)) ||
                    (module === serviceConstant.SERVER_INFO.AUTH_MODULE && (action === serviceConstant.AJAX_ACTION.CLOSE || action === serviceConstant.AJAX_ACTION.UPDATE)) ||
                    (module !== serviceConstant.SERVER_INFO.WEB_MODULE && module !== serviceConstant.SERVER_INFO.AUTH_MODULE)) { // other modules such as status.
                    // read token from service.auth if need
                    var token = localDataService.getDevice('token');
                    if (token) {
                        // For checkNewcomer (noToken is true), remove the token even if we have it
                        if (!opts.noToken) {
                            jsonObj = angular.extend({
                                token: token
                            }, jsonObj);
                        }
                    } else {
                        // module status and flowstat (with action `0`) allow no token
                        if (module !== serviceConstant.SERVER_INFO.STATUS_MODULE) {
                            logService.warn('serverDataService.request(' + module + '): token is needed, but not found! so the request is canceled.');
                            authInfoService.markLogin(false);
                            // although request fail, we also give callback a chance to execute
                            if (angular.isFunction(opts.callback)) {
                                opts.callback();
                            }
                            if (serviceConstant.GO_HOME_WHEN.TOKEN_ERROR) {
                                promptService.toast.warning('COMMON.CONTENT.LOGIN_REQUIRED');
                                linkService.goBackHome();
                            }
                            return;
                        }
                    }
                }

                httpService.post(url, jsonObj, config, function(data) {
                    serviceValue.serverDisconnectedCount = 0;
                    if (!data) {
                        return;
                    }
                    if (data.result < 0) {
                        // means auth fail, clear local auth info
                        authInfoService.clear();
                        authInfoService.markLogin(false);
                    }
                    if (angular.isFunction(opts.callback)) {
                        opts.callback(data);
                    }
                    if (data.result < 0) {
                        if (data.result == serviceConstant.AJAX_RESULT.KICKED_OUT) {
                            if (serviceConstant.GO_HOME_WHEN.KICKED_OUT) {
                                promptService.toast.warning('COMMON.CONTENT.KICKED_OUT');
                                linkService.goBackHome();
                            }
                        } else if (data.result == serviceConstant.AJAX_RESULT.TOKEN_ERROR) {
                            if (serviceConstant.GO_HOME_WHEN.TOKEN_ERROR) {
                                promptService.toast.warning('COMMON.CONTENT.LOGIN_REQUIRED');
                                linkService.goBackHome();
                            }
                        } else {
                            // other error, just think it's auth fail
                            if (serviceConstant.GO_HOME_WHEN.COMMON_ERR) {
                                promptService.toast.warning('COMMON.CONTENT.LOGIN_REQUIRED');
                                linkService.goBackHome();
                            }
                        }
                    }
                }, function(data) {
                    if (httpServer == serviceConstant.SERVER_INFO.PROTOCOL + serviceConstant.SERVER_INFO.SERVER_DOMAIN_NAME) {
                        // If the device has two or more network cards, the default dns route may fail, so try ip instead.
                        serviceValue.serverAddress = serviceConstant.SERVER_INFO.SERVER_IP;
                        request(opts);
                        return;
                    }
                    // although request fail, we also give callback a chance to execute
                    if (angular.isFunction(opts.callback)) {
                        opts.callback(data);
                    }
                    serviceValue.serverDisconnectedCount++;
                    if (serviceValue.serverDisconnectedCount == serviceConstant.GO_HOME_WHEN.SERVER_DISCONNECT_MAX) {
                        logService.error('serverDataService.request: fail to connect device, reach max count=' + serviceValue.serverDisconnectedCount);
                        // reset serverDisconnectedCount
                        serviceValue.serverDisconnectedCount = 0;
                        // reset serverAddress
                        serviceValue.serverAddress = serviceConstant.SERVER_INFO.SERVER_DOMAIN_NAME;
                        if (serviceConstant.GO_HOME_WHEN.SERVER_DISCONNECT) {
                            promptService.toast.warning('COMMON.CONTENT.SERVER_DISCONNECT');
                            linkService.goBackHome();
                        }
                    } else {
                        logService.warn('serverDataService.request: fail to connect device, accumulated count=' + serviceValue.serverDisconnectedCount);
                    }
                });
            }

            return {
                request: request
            }
        }
    ])

    /**
     * @description
     * Cookie/Local storage service.
     *
     * If local storage is not supported, use cookies instead.
     *
     * TIP: Some user info will be saved in client local storage.
     *      e.g. login/token info will make auto login easier.
     *
     * @memberof service
     * @ngdoc service
     * @name localDataService
     * @requires localStorageService
     * @requires dataSharingService
     */
    .factory('localDataService', ['localStorageService', 'dataSharingService',
        function(localStorageService, dataSharingService) {

            var _digest = function() {
                var status = dataSharingService.get('status');
                if (status && status.deviceInfo) {
                    return CryptoJS.MD5([status.deviceInfo.productID, status.deviceInfo.mac].join('_')).toString().substr(0, 8);
                } else {
                    return '0';
                }
            }

            /**
             * @description
             * Get one (key's) value.
             *
             * @memberof localDataService
             * @param {string} key the key string.
             * @returns {string} The value string.
             */
            var get = function(key) {
                return localStorageService.get(key);
            }

            /**
             * @description
             * Get one (key's) value (of App).
             *
             * @memberof localDataService
             * @param {string} key the key string.
             * @returns {string} The value string.
             */
            var getApp = function(key) {
                return localStorageService.get('app.' + key);
            }

            /**
             * @description
             * Get one (key's) value (of current device).
             *
             * @memberof localDataService
             * @param {string} key the key string.
             * @returns {string} The value string.
             */
            var getDevice = function(key) {
                return localStorageService.get('device.' + _digest() + '.' + key);
            }

            /**
             * @description
             * Set one (key's) value.
             *
             * @memberof localDataService
             * @param {string} key the key string.
             * @param {string} val the value string.
             */
            var set = function(key, val) {
                return localStorageService.set(key, val);
            }

            /**
             * @description
             * Set one (key's) value (of App).
             *
             * @memberof localDataService
             * @param {string} key the key string.
             * @param {string} val the value string.
             */
            var setApp = function(key, val) {
                return localStorageService.set('app.' + key, val);
            }

            /**
             * @description
             * Set one (key's) value (of current device).
             *
             * @memberof localDataService
             * @param {string} key the key string.
             * @param {string} val the value string.
             */
            var setDevice = function(key, val) {
                return localStorageService.set('device.' + _digest() + '.' + key, val);
            }

            /**
             * @description
             * Clear one (key's) value.
             *
             * @memberof localDataService
             * @param {string} key the key string.
             */
            var clear = function(key) {
                return localStorageService.remove(key);
            }

            /**
             * @description
             * Clear one (key's) value (of App).
             *
             * @memberof localDataService
             * @param {string} key the key string.
             */
            var clearApp = function(key) {
                return localStorageService.remove('app.' + key);
            }

            /**
             * @description
             * Clear one (key's) value (of current device).
             *
             * @memberof localDataService
             * @param {string} key the key string.
             */
            var clearDevice = function(key) {
                return localStorageService.remove('device.' + _digest() + '.' + key);
            }

            /**
             * @description
             * Clear all (key's) value.
             *
             * @memberof localDataService
             */
            var clearAll = function() {
                return localStorageService.clearAll();
            }

            return {
                get: get,
                getApp: getApp,
                getDevice: getDevice,
                set: set,
                setApp: setApp,
                setDevice: setDevice,
                clear: clear,
                clearApp: clearApp,
                clearDevice: clearDevice,
                clearAll: clearAll
            }
        }
    ])

    /**
     * @description
     * Data sharing service.
     *
     * Use this service to share data between controller, service or module...
     *
     * TIP: You can also use it to backup data at runtime.
     *
     * WARNING: The share is based on singleton service and object reference,
     * so any change on shared data will affect in all controller, service or module.
     *
     * @memberof service
     * @ngdoc service
     * @name dataSharingService
     */
    .factory('dataSharingService', [

        function() {
            var sharedData = {};
            /**
             * @description
             * Get one shared data.
             *
             * @memberof dataSharingService
             * @param {string} key The shared name.
             * @returns {object} The shared data.
             */
            var get = function(key) {
                if (key) {
                    return sharedData[key];
                } else {
                    return sharedData;
                }
            }

            /**
             * @description
             * Set one data to share.
             *
             * @memberof dataSharingService
             * @param {string} key The shared name.
             * @param {object} val The shared data.
             */
            var set = function(key, val) {
                if (!key) {
                    return;
                }
                sharedData[key] = val;
            }

            /**
             * @description
             * Clear (delete) one shared data.
             *
             * @memberof dataSharingService
             * @param {string} key The shared name name.
             */
            var clear = function(key) {
                if (!key) {
                    return;
                }
                delete sharedData[key];
            }

            return {
                get: get,
                set: set,
                clear: clear,
            }
        }
    ])

    /**
     * @description
     * Prompt service.
     *
     * This is the prompt version with i18n support.
     *
     * @memberof service
     * @ngdoc service
     * @name promptService
     * @requires languageService
     * @requires $timeout
     * @requires $ionicPopup
     * @requires $ionicLoading
     * @requires toastr
     * @requires cfpLoadingBar
     */
    .factory('promptService', ['languageService', '$timeout', '$ionicPopup', '$ionicLoading', 'toastr', 'cfpLoadingBar',
        function(languageService, $timeout, $ionicPopup, $ionicLoading, toastr, cfpLoadingBar) {
            /**
             * @description
             * Success toast, with i18n support.
             *
             * @memberof promptService
             * @alias toast.success
             * @param {string} message The message content to show.
             * @param {string} title The message title to show.
             * @param {number} duration The message will dismiss after duration time. Default value is 2s.
             */
            var toastSuccess = function(message, title, duration) {
                if (!duration) {
                    duration = 2 * 1000;
                }
                languageService.translate([message, title], function(string) {
                    toastr.success(string[message], string[title], {
                        timeOut: duration
                    });
                });
            }

            /**
             * @description
             * Info toast, with i18n support.
             *
             * @memberof promptService
             * @alias toast.info
             * @param {string} message The message content to show.
             * @param {string} title The message title to show.
             * @param {number} duration The message will dismiss after duration time. Default value is 3s.
             */
            var toastInfo = function(message, title, duration) {
                if (!duration) {
                    duration = 3 * 1000;
                }
                languageService.translate([message, title], function(string) {
                    toastr.info(string[message], string[title], {
                        timeOut: duration
                    });
                });
            }

            /**
             * @description
             * Warning toast, with i18n support.
             *
             * @memberof promptService
             * @alias toast.warning
             * @param {string} message The message content to show.
             * @param {string} title The message title to show.
             * @param {number} duration The message will dismiss after duration time. Default value is 4s.
             */
            var toastWarning = function(message, title, duration) {
                if (!duration) {
                    duration = 4 * 1000;
                }
                languageService.translate([message, title], function(string) {
                    toastr.warning(string[message], string[title], {
                        timeOut: duration
                    });
                });
            }

            /**
             * @description
             * Error toast, with i18n support.
             *
             * @memberof promptService
             * @alias toast.error
             * @param {string} message The message content to show.
             * @param {string} title The message title to show.
             * @param {number} duration The message will dismiss after duration time. Default value is 5s.
             */
            var toastError = function(message, title, duration) {
                if (!duration) {
                    duration = 5 * 1000;
                }
                languageService.translate([message, title], function(string) {
                    toastr.error(string[message], string[title], {
                        timeOut: duration
                    });
                });
            }

            /**
             * @description
             * Popup with options, without i18n support.
             *
             * @memberof promptService
             * @alias popup.showWithOptions
             * @param {object} opts The options for showing popup. Refer to [$ionicPopup](http://ionicframework.com/docs/api/service/$ionicPopup/).
             * @param {function} callback The callback function, invoked with arg `{any} res` after popup button tapped.
             */
            var popupShowWithOptions = function(opts, callback) {
                $ionicPopup.show(opts).then(function(res) {
                    if (angular.isFunction(callback)) {
                        callback(res);
                    }
                });
            }

            /**
             * @description
             * Popup alert with options, without i18n support.
             *
             * @memberof promptService
             * @alias popup.alertWithOptions
             * @param {object} opts The options for showing the alert. Refer to [$ionicPopup](http://ionicframework.com/docs/api/service/$ionicPopup/).
             * @param {function} callback The callback function, invoked with arg `{boolean} isOK` (always `true`) after popup button tapped.
             */
            var popupAlertWithOptions = function(opts, callback) {
                $ionicPopup.alert(opts).then(function(isOK) {
                    if (angular.isFunction(callback)) {
                        callback(isOK);
                    }
                });
            }

            /**
             * @description
             * Popup alert, with i18n support.
             *
             * @memberof promptService
             * @alias popup.alert
             * @param {string} message The message content to show.
             * @param {string|undefined} title The message title to show, hide if undefined.
             * @param {function} callback The callback function, invoked with arg `{boolean} isOK` (always `true`) after popup button tapped.
             */
            var popupAlert = function(message, title, callback) {
                languageService.translate([message, title, 'COMMON.CONTENT.OK'], function(string) {
                    popupAlertWithOptions({
                        title: string[title],
                        cssClass: string[title] === undefined ? 'hide-popup-title' : '',
                        template: string[message],
                        okText: string['COMMON.CONTENT.OK']
                    }, callback);
                });
            }

            /**
             * @description
             * Popup confirm with options, without i18n support.
             *
             * @memberof promptService
             * @alias popup.comfirmWithOptions
             * @param {object} opts The options for showing the confirm. Refer to [$ionicPopup](http://ionicframework.com/docs/api/service/$ionicPopup/).
             * @param {function} callback The callback function, invoked with arg `{boolean} isOK` after popup button tapped.
             */
            var popupConfirmWithOptions = function(opts, callback) {
                $ionicPopup.confirm(opts).then(function(isOK) {
                    if (angular.isFunction(callback)) {
                        callback(isOK);
                    }
                });
            }

            /**
             * @description
             * Popup confirm, with i18n support.
             *
             * @memberof promptService
             * @alias popup.confirm
             * @param {string} message The message content to show.
             * @param {string|undefined} title The message title to show, hide if undefined.
             * @param {function} callback The callback function, invoked with arg `{boolean} isOK` after popup button tapped.
             */
            var popupConfirm = function(message, title, callback) {
                languageService.translate([message, title, 'COMMON.CONTENT.OK', 'COMMON.CONTENT.CANCEL'], function(string) {
                    popupConfirmWithOptions({
                        title: string[title],
                        cssClass: string[title] === undefined ? 'hide-popup-title' : '',
                        template: string[message],
                        okText: string['COMMON.CONTENT.OK'],
                        cancelText: string['COMMON.CONTENT.CANCEL']
                    }, callback);
                });
            }

            /**
             * @description
             * Popup prompt with options, without i18n support.
             *
             * @memberof promptService
             * @alias popup.promptWithOptions
             * @param {object} opts The options for showing the prompt. Refer to [$ionicPopup](http://ionicframework.com/docs/api/service/$ionicPopup/).
             * @param {function} callback The callback function, invoked with arg `{string} input` after popup button tapped.
             */
            var popupPromptWithOptions = function(opts, callback) {
                $ionicPopup.prompt(opts).then(function(input) {
                    if (angular.isFunction(callback)) {
                        callback(input);
                    }
                });
            }

            /**
             * @description
             * Popup prompt, with i18n support.
             *
             * @memberof promptService
             * @alias popup.prompt
             * @param {string} message The message content to show.
             * @param {string|undefined} title The message title to show, hide if undefined.
             * @param {function} callback The callback function, invoked with arg `{string} input` after popup button tapped.
             * @param {string} inputType The input type (e.g. `password`).
             * @param {string} inputPlaceholder The input placeholder (e.g. `Please input password`).
             */
            var popupPrompt = function(message, title, callback, inputType, inputPlaceholder) {
                languageService.translate([message, title, 'COMMON.CONTENT.OK', 'COMMON.CONTENT.CANCEL', inputPlaceholder], function(string) {
                    popupPromptWithOptions({
                        title: string[title],
                        cssClass: string[title] === undefined ? 'hide-popup-title' : '',
                        template: string[message],
                        okText: string['COMMON.CONTENT.OK'],
                        cancelText: string['COMMON.CONTENT.CANCEL'],
                        inputType: inputType,
                        inputPlaceholder: string[inputPlaceholder]
                    }, callback);
                });
            }

            /**
             * @description
             * Show loading prompt with options, without i18n support.
             *
             * @memberof promptService
             * @alias loading.showWithOptions
             * @param {object} opts The options for the loading indicator. Refer to [$ionicLoading](http://ionicframework.com/docs/api/service/$ionicLoading/).
             */
            var loadingShowWithOptions = function(opts) {
                $ionicLoading.show(opts);
            }

            var loadingCloseCallback = null;
            var loadingCloseIcon = '<i class="ion-close-circled assertive loading-closeIcon" ng-click="serviceBundle.promptService.loading.hide(0)"></i>';

            /**
             * @description
             * Show loading prompt, with i18n support.
             *
             * @memberof promptService
             * @alias loading.show
             * @param {string} message The message content or object to show.
             * The object like this
             * ```
             * {
             *     message: 'Hello',
             *     duration: 10000,
             *     scope: $scope,
             *     showCloseIcon: true,
             *     callback: closeCallback
             * }
             * ```
             * WARNING: If loading hide automatically via `duration`, then `closeCallback` won't be triggered!
             * @param {number} duration How many milliseconds to wait until automatically hiding the indicator. By default, the indicator will be shown until hide() is called.
             * If `message` is object, this arg will be ignored.
             * @param {boolean} showCloseIcon Need close icon? Default `false`.
             * If `message` is object, this arg will be ignored.
             */
            var loadingShow = function(message, duration, showCloseIcon) {
                loadingCloseCallback = null;
                var closeIcon = '';
                if (angular.isString(message)) {
                    if (showCloseIcon) {
                        closeIcon = loadingCloseIcon;
                    }
                    languageService.translate(message, function(message) {
                        loadingShowWithOptions({
                            template: closeIcon + message,
                            duration: duration
                        });
                    });
                } else if (angular.isObject(message)) {
                    var opts = message;
                    loadingCloseCallback = opts.callback; // maybe `undefined`
                    if (opts.showCloseIcon) {
                        closeIcon = loadingCloseIcon;
                    }
                    if (angular.isString(opts.message)) {
                        languageService.translate(opts.message, function(message) {
                            loadingShowWithOptions({
                                template: closeIcon + message,
                                duration: opts.duration,
                                scope: opts.scope
                            });
                        });
                    } else {
                        loadingShowWithOptions({
                            template: closeIcon + '<ion-spinner></ion-spinner>',
                            duration: opts.duration,
                            scope: opts.scope
                        });
                    }
                } else {
                    if (showCloseIcon) {
                        closeIcon = loadingCloseIcon;
                    }
                    loadingShowWithOptions({
                        template: closeIcon + '<ion-spinner></ion-spinner>',
                        duration: duration
                    });
                }
            }

            /**
             * @description
             * Hide loading prompt, with i18n support.
             *
             * NOTE: As angular's $scope is asynchronous, so we delay hide action some seconds, to ensure data loaded before loading hidden.
             *
             * @memberof promptService
             * @alias loading.hide
             * @param {number} delay The loading hidden will execute after delay time. Default value is 0.2s.
             */
            var loadingHide = function(delay) {
                var d = 200;
                if (angular.isNumber(delay) && delay >= 0) {
                    d = delay;
                }
                $timeout($ionicLoading.hide, d);
                if (angular.isFunction(loadingCloseCallback)) {
                    loadingCloseCallback();
                }
            }

            /**
             * @description
             * Start loading bar
             *
             * @memberof promptService
             * @alias loadingBar.start
             */
            var loadingBarStart = function() {
                cfpLoadingBar.start();
            }

            /**
             * @description
             * Set the progress percent of loading bar
             *
             * @memberof promptService
             * @alias loadingBar.set
             * @param {number} percent The valid value is `[0, 1]`.
             */
            var loadingBarSet = function(percent) {
                cfpLoadingBar.set(percent);
            }

            /**
             * @description
             * Complete loading bar
             *
             * @memberof promptService
             * @alias loadingBar.complete
             */
            var loadingBarComplete = function() {
                cfpLoadingBar.complete();
            }

            return {
                toast: {
                    success: toastSuccess,
                    info: toastInfo,
                    warning: toastWarning,
                    error: toastError
                },
                popup: {
                    showWithOptions: popupShowWithOptions,
                    alertWithOptions: popupAlertWithOptions,
                    alert: popupAlert,
                    confirmWithOptions: popupConfirmWithOptions,
                    confirm: popupConfirm,
                    promptWithOptions: popupPromptWithOptions,
                    prompt: popupPrompt
                },
                loading: {
                    showWithOptions: loadingShowWithOptions,
                    show: loadingShow,
                    hide: loadingHide
                },
                loadingBar: {
                    start: loadingBarStart,
                    set: loadingBarSet,
                    complete: loadingBarComplete
                }
            }
        }
    ])


    /**
     * @description
     * Notification service.
     *
     * Local notification service with i18n support, depend on cordova.plugins.notification.
     *
     * @memberof service
     * @ngdoc service
     * @name notificationService
     * @requires serviceConstant
     * @requires httpService
     * @requires dataSharingService
     * @requires languageService
     * @requires localDataService
     * @requires $interval
     * @requires cordova.plugins.notification
     */
    .factory('notificationService', ['serviceConstant', 'httpService', 'dataSharingService', 'languageService', 'localDataService', '$interval',
        function(serviceConstant, httpService, dataSharingService, languageService, localDataService, $interval) {
            var id;
            var notifications = []; // notifications for polling
            var NOTIFICATION_INTERVAL;
            var intervalPromise;
            var oldStatus;
            var newStatus;

            /**
             * @description
             * Create one notification with i18n support.
             *
             * @memberof notificationService
             * @alias create
             * @param {string} content The notification content.
             */
            var createNotification = function(content) {
                languageService.translate(content, function(content) {
                    if (window.cordova && window.cordova.plugins && window.cordova.plugins.notification) {
                        window.cordova.plugins.notification.local.schedule({
                            id: id++,
                            text: content
                        });
                    }
                });
            }

            /**
             * @description
             * Clear (delete) all notifications (for polling).
             *
             * @memberof notificationService
             * @private
             */
            var clearNotifications = function() {
                notifications = [];
            }

            /**
             * @description
             * Reset all notification's isNotified flag to `false`.
             *
             * @memberof notificationService
             * @private
             */
            var resetNotifiedFlag = function() {
                notifications.forEach(function(item) {
                    item.isNotified = false;
                })
            }

            /**
             * @description
             * Register one notification object.
             *
             * @memberof notificationService
             * @param {object} obj The object needs to notify.
             * @example
             * register({
             *     description: 'disconnect from router',
             *     repeat: false,
             *     content: 'COMMON.CONTENT.SERVER_DISCONNECT',
             *     notificationCondition: function(oldStatus, newStatus) {
             *         if (!newStatus) {
             *             return true;
             *         } else {
             *             return false;
             *         }
             *     });
             * }
             */
            var register = function(obj) {
                if (obj === undefined) {
                    return;
                }
                if (obj.repeat === undefined) {
                    obj.repeat = false;
                }
                if (obj.notificationCondition === undefined) {
                    return;
                }
                notifications.push(obj);
            }

            /**
             * @description
             * Traverse registered notifications to find out those need to notify.
             *
             * @memberof notificationService
             * @private
             */
            var traverseNotifications = function() {
                notifications.forEach(function(item) {
                    if (item.repeat === false && item.isNotified) {
                        return;
                    }
                    if (item.notificationCondition(oldStatus, newStatus) === true) {
                        createNotification(item.content);
                        item.isNotified = true;
                    }
                });
            }

            /**
             * @description
             * Load notification config file.
             *
             * This API has been *deprecated*, and
             * upper mod should use register() to watch the notification it cares.
             *
             * @memberof notificationService
             * @alias config
             * @deprecated
             * @param {string} path The notification config file's path
             */
            var loadConfig = function(path) {
                var configs;
                clearNotifications();
                httpService.get(path, {
                    ignoreLoadingBar: true
                }, function(data) {
                    configs = eval(data);
                    configs.forEach(function(item) {
                        register(item);
                    });
                });
            }

            /**
             * @description
             * Start notification polling service.
             *
             * @memberof notificationService
             * @private
             */
            var startPolling = function() {
                // Re-Init notification id and status obj.
                id = 0;
                oldStatus = dataSharingService.get(serviceConstant.SERVER_INFO.STATUS_MODULE);
                // Create interval task
                intervalPromise = $interval(function() {
                    newStatus = dataSharingService.get(serviceConstant.SERVER_INFO.STATUS_MODULE);
                    if (notifications.length === 0) {
                        return;
                    }
                    if (oldStatus !== undefined) {
                        traverseNotifications();
                    }
                    oldStatus = newStatus;
                }, NOTIFICATION_INTERVAL);
            }

            /**
             * @description
             * Stop notification polling service.
             *
             * @memberof notificationService
             * @private
             */
            var stopPolling = function() {
                if (intervalPromise) {
                    $interval.cancel(intervalPromise);
                    resetNotifiedFlag();
                }
            }

            /**
             * @description
             * Enable notification polling service.
             *
             * @memberof notificationService
             * @alias enable
             * @param {number} interval
             */
            var enablePolling = function(interval) {
                NOTIFICATION_INTERVAL = (angular.isNumber(interval) && interval > 0) ? interval : 30000;
                //startPolling();	// just startPolling when App at background, refer to event: pause
                document.addEventListener('pause', startPolling);
                document.addEventListener('resume', stopPolling);
                localDataService.setApp('notify.isOn', true);
            }

            /**
             * @description
             * Disable notification polling service.
             *
             * @memberof notificationService
             * @alias disable
             */
            var disablePolling = function() {
                stopPolling(); // always stopPolling no matter App at foreground or background
                document.removeEventListener('pause', startPolling);
                document.removeEventListener('resume', stopPolling);
                localDataService.setApp('notify.isOn', false);
            }

            /**
             * @description
             * Get the flag whether notification service can be enabled.
             *
             * @memberof notificationService
             * @alias isNotifyOn
             * @returns {boolean} Whether notification service can be enabled
             */
            var isNotifyOn = function() {
                var val = localDataService.getApp('notify.isOn');
                if (val !== false) {
                    return true;
                } else {
                    return false;
                }
            }

            return {
                create: createNotification,
                register: register,
                config: loadConfig,
                enable: enablePolling,
                disable: disablePolling,
                isNotifyOn: isNotifyOn
            };
        }
    ])

    /**
     * @description
     * Permission service.
     *
     * native app permission related api.
     *
     * @memberof service
     * @ngdoc service
     * @name permissionService
     * @requires cordova.plugins.notification
     */
    .factory('permissionService', [

        function() {
            /**
             * @description
             * Register notification permission.
             *
             * @memberof permissionService
             * @alias registerNotification
             * @param {function} callback The callback function, invoked with arg `{bool} granted`.
             */
            var registerNotification = function(callback) {
                if (window.cordova && window.cordova.plugins && window.cordova.plugins.notification) {
                    cordova.plugins.notification.local.registerPermission(callback);
                } else {
                    if (angular.isFunction(callback)) {
                        callback(false);
                    }
                }
            };

            /**
             * @description
             * Check notification permission.
             *
             * @memberof permissionService
             * @alias checkNotification
             * @param {function} callback The callback function, invoked with arg `{bool} granted`.
             */
            var checkNotification = function(callback) {
                if (window.cordova && window.cordova.plugins && window.cordova.plugins.notification) {
                    cordova.plugins.notification.local.hasPermission(callback);
                } else {
                    if (angular.isFunction(callback)) {
                        callback(false);
                    }
                }
            }

            return {
                registerNotification: registerNotification,
                checkNotification: checkNotification
            };
        }
    ])

    /**
     * @description
     * App update service.
     *
     * @memberof service
     * @ngdoc service
     * @name appUpdateService
     * @requires protocolConstant
     * @requires serviceValue
     * @requires httpService
     * @requires logService
     * @requires diffUtil
     * @requires $window
     */
    .factory('appUpdateService', ['protocolConstant', 'serviceValue', 'httpService', 'logService', 'diffUtil', '$window',
        function(protocolConstant, serviceValue, httpService, logService, diffUtil, $window) {
            /**
             * @description
             * The result of check update.
             *
             * ```
             * {
             *     NOT_SUPPORTED_PLATFORM: -2,
             *     NO_INTERNET: -1,
             *     NO_NEW_VER: 0,
             *     NEW_VER: 1
             * }
             * ```
             *
             * @memberof appUpdateService
             */
            var result = {
                NOT_SUPPORTED_PLATFORM: -2,
                NO_INTERNET: -1,
                NO_NEW_VER: 0,
                NEW_VER: 1
            };

            var appStore = {
                ANDROID: {
                    APP_PACKAGE_NAME: protocolConstant.APP.ID,
                    LOOKUP_URL: 'https://starter.ionic.xfally.github.i',
                    CHECK_NEW_VER: 'getNewestAppVersion',
                    APP_URL: ''
                },
                IOS: {
                    LOOKUP_URL: 'http://itunes.apple.com/lookup?id=',
                    APP_URL: 'https://itunes.apple.com/app/id',
                    APP_ID: '123456789' // The app id in applestore.
                }
            };

            /**
             * @description
             * Check update from app store.
             *
             * @memberof appUpdateService
             * @param {function} callback The callback function, invoked with arg `{number} result`.
             */
            var checkUpdateFromAppStore = function(callback) {
                if (!angular.isFunction(callback)) {
                    logService.error("appUpdateService.checkUpdateFromAppStore: No callback!");
                    return;
                }
                logService.debug("appUpdateService.checkUpdateFromAppStore: ionicPlatform.currentPlatform=" + serviceValue.ionicPlatform.currentPlatform +
                    ", ionicPlatform.currentPlatformVersion=" + serviceValue.ionicPlatform.currentPlatformVersion);
                if (serviceValue.ionicPlatform.isAndroid) {
                    var jsonObj = {
                        method: appStore.ANDROID.CHECK_NEW_VER,
                        params: {
                            appPackageName: appStore.ANDROID.APP_PACKAGE_NAME
                        }
                    };
                    httpService.post(appStore.ANDROID.LOOKUP_URL, jsonObj, undefined, function(data) {
                        if (!data || data.error_code !== 0) {
                            logService.warn('appUpdateService.checkUpdateFromAppStore: Server internal error or no such app detected');
                            callback(result.NO_NEW_VER);
                            return;
                        }
                        if (data.result && data.result.versionName && diffUtil.compareVersion(protocolConstant.APP.VER, data.result.versionName, {
                            zeroExtend: true
                        }) < 0) {
                            callback(result.NEW_VER);
                            appStore.ANDROID.APP_URL = data.result.appUrl;
                        } else {
                            logService.info("appUpdateService.checkUpdateFromAppStore: No new version");
                            callback(result.NO_NEW_VER);
                        }
                    }, function(data) {
                        logService.error("appUpdateService.checkUpdateFromAppStore: No internet");
                        callback(result.NO_INTERNET);
                    });
                } else if (serviceValue.ionicPlatform.isIOS || serviceValue.ionicPlatform.isIPad) {
                    httpService.get(appStore.IOS.LOOKUP_URL + appStore.IOS.APP_ID, undefined, function(data) {
                        if (data && data.results[0] && data.results[0].version && diffUtil.compareVersion(protocolConstant.APP.VER, data.results[0].version, {
                            zeroExtend: true
                        }) < 0) {
                            callback(result.NEW_VER);
                        } else {
                            logService.info("appUpdateService.checkUpdateFromAppStore: No new version");
                            callback(result.NO_NEW_VER);
                        }
                    }, function(data) {
                        logService.error("appUpdateService.checkUpdateFromAppStore: No internet");
                        callback(result.NO_INTERNET);
                    });
                } else {
                    logService.warn("appUpdateService.checkUpdateFromAppStore: Not supported ionicPlatform.currentPlatform=" + serviceValue.ionicPlatform.currentPlatform);
                    callback(result.NOT_SUPPORTED_PLATFORM);
                }
            }

            /**
             * @description
             * Go to app store.
             *
             * @memberof appUpdateService
             */
            var gotoAppStore = function() {
                var appUrl;
                if (serviceValue.ionicPlatform.isAndroid) {
                    appUrl = appStore.ANDROID.APP_URL;
                    if (window.cordova && window.cordova.InAppBrowser) {
                        cordova.InAppBrowser.open(appUrl, '_system', 'location=yes');
                    } else {
                        $window.open(appUrl, '_blank');
                    }
                } else if (serviceValue.ionicPlatform.isIOS || serviceValue.ionicPlatform.isIPad) {
                    appUrl = appStore.IOS.APP_URL + appStore.IOS.APP_ID;
                    if (window.cordova && window.cordova.InAppBrowser) {
                        // Open url in system browser
                        cordova.InAppBrowser.open(appUrl, '_system', 'location=yes');
                    } else {
                        $window.open(appUrl, '_blank');
                    }
                } else {
                    logService.warn("appUpdateService.gotoAppStore: Not supported ionicPlatform.currentPlatform=" + serviceValue.ionicPlatform.currentPlatform);
                }
            }

            return {
                result: result,
                checkUpdateFromAppStore: checkUpdateFromAppStore,
                gotoAppStore: gotoAppStore
            };
        }
    ])

    /**
     * @description
     * Service bundle.
     *
     * Bundle all services into one service.
     * Other module can depend on `serviceBundle` and use any API under it, like `serviceBundle.xxx.yyy()`.
     * Html can use `serviceBundle.xxx.yyy()` directly as it has been exported to `$rootScope`.
     *
     * @example
     * serviceBundle.serverDataService.request({
     *     module: 'status',
     *     action: 0,
     *     callback: updateData.status
     * });
     *
     * @memberof service
     * @ngdoc service
     * @name serviceBundle
     * @requires $rootScope
     * @requires serviceConstant
     * @requires serviceValue
     * @requires logService
     * @requires languageService
     * @requires linkService
     * @requires httpService
     * @requires modService
     * @requires authInfoService
     * @requires authService
     * @requires serverDataService
     * @requires localDataService
     * @requires dataSharingService
     * @requires promptService
     * @requires notificationService
     * @requires permissionService
     * @requires appUpdateService
     */
    .factory('serviceBundle', ['$rootScope', '$window', 'serviceConstant', 'serviceValue', 'logService', 'languageService', 'linkService', 'httpService', 'modService', 'authInfoService', 'authService',
        'serverDataService', 'localDataService', 'dataSharingService', 'promptService', 'notificationService', 'permissionService', 'appUpdateService',
        function($rootScope, $window, serviceConstant, serviceValue, logService, languageService, linkService, httpService, modService, authInfoService, authService,
            serverDataService, localDataService, dataSharingService, promptService, notificationService, permissionService, appUpdateService) {
            var api = {
                serviceConstant: serviceConstant,
                serviceValue: serviceValue,
                logService: logService,
                languageService: languageService,
                linkService: linkService,
                httpService: httpService,
                serverDataService: serverDataService,
                modService: modService,
                authInfoService: authInfoService,
                authService: authService,
                localDataService: localDataService,
                dataSharingService: dataSharingService,
                promptService: promptService,
                notificationService: notificationService,
                permissionService: permissionService,
                appUpdateService: appUpdateService
            }

            // Export service to html
            $rootScope.serviceBundle = api;
            // Export browser window
            $window.serviceBundle = api;
            return api;
        }
    ])

})();

