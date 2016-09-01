(function() {
    'use strict';

    /**
     * @description
     * Home is the core module and main UI for App, all other modules could depend on it.
     * If you unload it, App will show a blank UI probably.
     *
     * @memberof mod
     * @ngdoc overview
     * @name mod.home
     * @requires service
     * @requires util
     * @requires protocol
     */
    angular.module('mod.home', ['service', 'util', 'protocol'])

    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
        function($stateProvider, $urlRouterProvider, $locationProvider) {
            //=== Router rule ===//
            // NOTICE: As we use ion-nav-view to embed child page, so the mod's url will like this: `http://<ip>/#/[mod_url]`,
            //         "#" means it is a "Hashbang URLs" in index.html, but be care that it's NOT a simple anchor link!
            //         When you set "href" in html, remember to use "#" as prefix, like: `<a href="#/home">`,
            //         Anyway, we suggest to use common function, like jumpToMod() to process these link's detail.
            $stateProvider
                .state('home', {
                    url: '/home',
                    templateUrl: 'mod/home/mod.html',
                    controller: 'homeCtrl'
                });
        }
    ])

    .run(['$ionicPlatform', 'serviceBundle',
        function($ionicPlatform, serviceBundle) {
            $ionicPlatform.ready(function() {
                serviceBundle.notificationService.register({
                    description: 'disconnect from router',
                    repeat: false,
                    content: 'COMMON.CONTENT.SERVER_DISCONNECT',
                    notificationCondition: function(oldStatus, newStatus) {
                        if (!newStatus) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                });
                // you can register more notifications
            });
        }
    ])

    .constant('homeConstant', {
        MOD_NAME: 'home',
        HEARTBEAT_INTERVAL: 10 * 1000,
        CHECK_UPDATE_INTERVAL: 24 * 60 * 60 * 1000
    })

    .value('homeValue', {
        // Stop status polling, home mod may be depend on this flag.
        stopStatusPolling: false,
    })

    .controller('homeCtrl', ['homeConstant', 'homeValue', 'serviceBundle', 'utilBundle', 'protocolBundle',
        '$rootScope', '$scope', '$ionicSideMenuDelegate', '$ionicPlatform', '$interval', '$window', '$timeout',
        function(homeConstant, homeValue, serviceBundle, utilBundle, protocolBundle,
            $rootScope, $scope, $ionicSideMenuDelegate, $ionicPlatform, $interval, $window, $timeout) {
            serviceBundle.modService.initMod($scope, {
                enter: enterCallback,
                beforeLeave: beforeLeaveCallback,
                resume: resumeCallback
            }, true);

            // NOTICE:
            // $scope.xxx variable must be object, not primitive (e.g., number, string, boolean).
            //     So child $scope can inherit it, not copy it!
            //     Refer to https://github.com/angular/angular.js/wiki/Understanding-Scopes
            // Surely, you can also use "controller as" syntax to avoid this issue.
            //     Refer to http://stackoverflow.com/questions/21287794/angularjs-controller-as-syntax-clarification
            $scope.data = {
                // local data. If needed, define it to process local data or local flags
                local: {
                    isHome: true, // is at home now? This flag is only used to `hide-nav-bar` to make animation more smooth!
                    isConnect: false, // is connected to server?
                    isLogin: false, // is login?
                    hasNewAppVer: false,
                    status: {}
                },
                // server data.
                server: {},
                // server data's backup. If needed, define it to backup server data, which is used to compare modification before submit data to server.
                backup: {}
            };

            $scope.action = {
                toggleSideMenu: function() {
                    $ionicSideMenuDelegate.toggleLeft();
                },
                closeSideMenu: function() {
                    if ($ionicSideMenuDelegate.isOpenLeft()) {
                        $ionicSideMenuDelegate.toggleLeft();
                    }
                },
                jumpToMod: function(mod) {
                    // If server disconnected, don't jump.
                    if (!$scope.data.local.isConnect && mod != serviceBundle.serviceConstant.MOD.ABOUT && mod != 'test') {
                        serviceBundle.promptService.toast.warning('COMMON.CONTENT.SERVER_DISCONNECT');
                        $scope.action.closeSideMenu();
                        return;
                    }
                    $scope.action.closeSideMenu();
                    serviceBundle.linkService.gotoMod(mod);
                },
                // 2in1: login and logout
                login: function() {
                    if (!$scope.data.local.isLogin) {
                        // login
                        $scope.action.jumpToMod(serviceBundle.serviceConstant.MOD.LOGIN);
                        return;
                    } else {
                        // logout
                        $scope.data.local.isLogin = false;
                        serviceBundle.authService.logout();
                        serviceBundle.promptService.toast.success('HOME.CONTENT.LOGOUT_OK');
                    }
                }
            };

            var updateView = {
                status: function(data) {
                    if (!data || data.result !== 0) {
                        //serviceBundle.promptService.toast.warning('COMMON.CONTENT.SERVER_DISCONNECT');
                        $scope.data.local.isConnect = false;
                        $scope.data.server.status = {};
                        $scope.data.local.status = {};
                        serviceBundle.dataSharingService.set('status', null);
                        return;
                    }

                    $scope.data.local.isConnect = true;

                    // Share data `status` to all mods
                    serviceBundle.dataSharingService.set('status', data);

                    if (!serviceBundle.linkService.isHome()) {
                        // if has jump to child mod, stop update home view
                        return;
                    }

                    // Re-init data.
                    $scope.data.server.status = data;
                    // deep copy
                    $scope.data.backup.status = {};
                    angular.copy(data, $scope.data.backup.status);

                    // Create local.status for process text easier.
                    $scope.data.local.status = {};
                    angular.copy(data, $scope.data.local.status);
                }
            };

            function enterCallback() {
                $scope.data.local.isHome = true;
                requestData();
            }

            function beforeLeaveCallback() {
                $scope.data.local.isHome = false;
            }

            function resumeCallback() {
                requestData();
            }

            function requestData() {
                if (homeValue.stopStatusPolling) {
                    $interval.cancel($scope.data.local.stopStatusPollingHandler);
                    return;
                }
                serviceBundle.serverDataService.request({
                    ignoreLoadingBar: true,
                    module: 'status',
                    action: 0,
                    callback: function(data) {
                        if (data) {
                            updateView.status(data);
                            serviceBundle.authService.checkLogin(function(data, isLogin) {
                                if (isLogin) {
                                    $scope.data.local.isLogin = true;
                                } else {
                                    $scope.data.local.isLogin = false;
                                }
                            });
                        }
                    }
                });
            }

            // Tip: if network is heavy load, try to move it to front location, to update View faster.
            // WARNING: As angular-cache, controller will just do requestData here once. Use `modService.initMod` (stateChangeStart) or $interval to do multi-times.
            requestData();

            // Request data and update view periodically
            // but if stopStatusPolling, prevent interval to debug easier
            if (!homeValue.stopStatusPolling) {
                $scope.data.local.stopStatusPollingHandler = $interval(requestData, homeConstant.HEARTBEAT_INTERVAL);
            }

            window.addEventListener('resize', function() {
                updateView.status(serviceBundle.dataSharingService.get('status'));
            });

            // check app update
            function checkUpdateFromAppStore() {
                serviceBundle.appUpdateService.checkUpdateFromAppStore(function(result) {
                    if (result == serviceBundle.appUpdateService.result.NEW_VER) {
                        $scope.data.local.hasNewAppVer = true;
                        serviceBundle.localDataService.setApp('hasNewVer', true);
                        serviceBundle.languageService.translate(['HOME.CONTENT.UPDATE.TITLE', 'HOME.CONTENT.UPDATE.CONTENT.APP_HAS_NEW_VER', 'HOME.CONTENT.UPDATE.CONTENT.UPDATE_NOW', 'HOME.CONTENT.UPDATE.CONTENT.UPDATE_LATER'], function(string) {
                            serviceBundle.promptService.popup.confirmWithOptions({
                                title: string['HOME.CONTENT.UPDATE.TITLE'],
                                template: string['HOME.CONTENT.UPDATE.CONTENT.APP_HAS_NEW_VER'],
                                okText: string['HOME.CONTENT.UPDATE.CONTENT.UPDATE_NOW'],
                                cancelText: string['HOME.CONTENT.UPDATE.CONTENT.UPDATE_LATER'],
                                scope: $scope
                            }, function(isOK) {
                                if (isOK) {
                                    serviceBundle.appUpdateService.gotoAppStore();
                                }
                            });
                        });
                    } else {
                        $scope.data.local.hasNewAppVer = false;
                        serviceBundle.localDataService.setApp('hasNewVer', false);
                    }
                });
            }
            $timeout(checkUpdateFromAppStore, 500);
            $scope.data.local.stopCheckAppUpdateHandler = $interval(checkUpdateFromAppStore, homeConstant.CHECK_UPDATE_INTERVAL);

            // notification
            if (serviceBundle.localDataService.getApp('permission.notification') === null) {
                serviceBundle.permissionService.registerNotification(function(granted) {
                    if (granted) {
                        serviceBundle.localDataService.setApp('permission.notification', true);
                        if (serviceBundle.notificationService.isNotifyOn()) {
                            serviceBundle.notificationService.enable();
                            return;
                        }
                    }
                    serviceBundle.notificationService.disable();
                });
            } else {
                serviceBundle.permissionService.checkNotification(function(granted) {
                    if (serviceBundle.notificationService.isNotifyOn() && granted) {
                        serviceBundle.notificationService.enable();
                    }
                });
            }

            // introduce
            if (serviceBundle.localDataService.getApp('ver') !== protocolBundle.protocolConstant.APP.VER) {
                serviceBundle.localDataService.setApp('ver', protocolBundle.protocolConstant.APP.VER);
                $timeout(function() {
                    serviceBundle.linkService.gotoMod('introduce');
                }, 1500);
                return;
            }
        }
    ])

})();

