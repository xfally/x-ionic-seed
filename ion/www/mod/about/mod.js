(function() {
    'use strict';

    /**
     * @description
     * About is module to show App version and update.
     *
     * @memberof mod
     * @ngdoc overview
     * @name mod.about
     * @requires service
     * @requires util
     * @requires protocol
     */
    angular.module('mod.about', ['service', 'util', 'protocol'])

    .config(['$stateProvider', '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('about', {
                    url: '/about',
                    templateUrl: 'mod/about/mod.html',
                    controller: 'aboutCtrl'
                })
        }
    ])

    .controller('aboutCtrl', ['serviceBundle', 'utilBundle', 'protocolBundle', '$scope', '$window',
        function(serviceBundle, utilBundle, protocolBundle, $scope, $window) {
            serviceBundle.modService.initMod($scope, {
                enter: enterCallback,
                beforeLeave: beforeLeaveCallback
            }, true);

            $scope.data = {
                local: {
                    images: {
                        logo: serviceBundle.modService.getModImgUrl('logo.png')
                    },
                    hasNewVer: serviceBundle.localDataService.getApp('hasNewVer') || false,
                    noticeOn: serviceBundle.notificationService.isNotifyOn(),
                    companyHomepage: 'xfally.github.io'
                }
            };

            $scope.action = {
                update: function() {
                    if ($scope.data.local.hasNewVer) {
                        serviceBundle.appUpdateService.gotoAppStore();
                    } else {
                        serviceBundle.promptService.loading.show('ABOUT.CONTENT.CHECKING');
                        serviceBundle.appUpdateService.checkUpdateFromAppStore(function(result) {
                            serviceBundle.promptService.loading.hide();
                            if (result == serviceBundle.appUpdateService.result.NEW_VER) {
                                $scope.data.local.hasNewVer = true;
                                serviceBundle.localDataService.setApp('hasNewVer', true);
                            } else if (result == serviceBundle.appUpdateService.result.NO_NEW_VER) {
                                serviceBundle.promptService.toast.info('ABOUT.CONTENT.NO_NEW_VERSION');
                                serviceBundle.localDataService.setApp('hasNewVer', false);
                            } else if (result == serviceBundle.appUpdateService.result.NO_INTERNET) {
                                serviceBundle.promptService.toast.warning('ABOUT.CONTENT.NO_INTERNET');
                                serviceBundle.localDataService.clearApp('hasNewVer');
                            } else if (result == serviceBundle.appUpdateService.result.NOT_SUPPORTED_PLATFORM) {
                                serviceBundle.promptService.toast.info('ABOUT.CONTENT.NO_NEW_VERSION');
                                serviceBundle.localDataService.clearApp('hasNewVer');
                            } else {
                                serviceBundle.promptService.toast.info('ABOUT.CONTENT.NO_NEW_VERSION');
                                serviceBundle.localDataService.clearApp('hasNewVer');
                            }
                        });
                    }
                },
                notice: function() {
                    if ($scope.data.local.noticeOn) {
                        serviceBundle.permissionService.checkNotification(function(granted) {
                            if (!granted) {
                                $scope.data.local.noticeOn = false;
                                serviceBundle.promptService.popup.confirm('ABOUT.CONTENT.PERMISSION_DENIED', 'ABOUT.CONTENT.NOTIFICATION', function callback(isOK) {
                                    if (isOK) {
                                        if (window.cordova && window.cordova.plugins.settings) {
                                            cordova.plugins.settings.open();
                                        }
                                    }
                                });
                            } else {
                                serviceBundle.notificationService.enable();
                            }
                        });
                    } else {
                        serviceBundle.notificationService.disable();
                    }
                },
                openCompanyUrl: function() {
                    if (window.cordova && window.cordova.InAppBrowser) {
                        // Open url in system browser
                        cordova.InAppBrowser.open('http://' + $scope.data.local.companyHomepage, '_system', 'location=yes');
                    } else {
                        $window.open('http://' + $scope.data.local.companyHomepage, '_blank');
                    }
                }
            };

            function enterCallback() {
                // When user view App about info, should prevent auto go home when disconnected from server.
                serviceBundle.linkService.preventAutoJumpWhenError();
            }

            function beforeLeaveCallback() {
                serviceBundle.linkService.allowAutoJumpWhenError();
            }
        }
    ])

})();

