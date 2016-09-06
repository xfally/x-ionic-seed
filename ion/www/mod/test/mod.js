(function() {
    'use strict';

    /**
     * @description
     * Test is module to test style, i18n and more features of App.
     * You should delete or hide it before release App.
     *
     * @memberof mod
     * @ngdoc overview
     * @name mod.test
     * @requires service
     * @requires util
     * @requires protocol
     */
    angular.module('mod.test', ['service', 'util', 'protocol'])

    .config(['$stateProvider', '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('test', {
                    url: '/test',
                    templateUrl: 'mod/test/mod.html',
                    controller: 'testCtrl'
                })
                // Now, test has its own child mod named as 'test-detail'.
                // NOTICE: Use '-' instead of '.' for `state` name, or won't work (is a bug?)
                .state('test-detail', {
                    url: '/test-detail',
                    params: {
                        say: undefined
                    },
                    templateUrl: 'mod-test-detail.html',
                    controller: 'testDetailCtrl'
                })
                .state('test-template', {
                    url: '/test-template',
                    templateUrl: 'mod/test/template/test.html',
                    controller: 'testTemplateCtrl'
                })
        }
    ])

    .factory('testUtil', ['utilBundle', 'serviceBundle',
        function(utilBundle, serviceBundle) {

            var enterCallback = function() {
                serviceBundle.linkService.preventAutoJumpWhenError();
            }

            var beforeLeaveCallback = function() {
                serviceBundle.linkService.allowAutoJumpWhenError();
            }

            return {
                enterCallback: enterCallback,
                beforeLeaveCallback: beforeLeaveCallback
            }
        }
    ])

    .controller('testCtrl', ['serviceBundle', 'utilBundle', 'protocolBundle', '$scope', 'homeValue', 'testUtil', '$ionicModal', '$timeout',
        function(serviceBundle, utilBundle, protocolBundle, $scope, homeValue, testUtil, $ionicModal, $timeout) {
            serviceBundle.modService.initMod($scope, {
                enter: testUtil.enterCallback,
                beforeLeave: testUtil.beforeLeaveCallback,
                unloaded: unloadedCallback
            }, true);

            //serviceBundle.logService.log(homeValue.stopStatusPolling);
            //homeValue.stopStatusPolling = !homeValue.stopStatusPolling;
            //serviceBundle.logService.log(homeValue.stopStatusPolling);

            // NOTICE:
            // $scope.xxx variable must be object, not primitive (e.g., number, string, boolean).
            //     So child $scope can inherit it, not copy it!
            //     Refer to https://github.com/angular/angular.js/wiki/Understanding-Scopes
            // Surely, you can also use "controller as" syntax to avoid this issue.
            //     Refer to http://stackoverflow.com/questions/21287794/angularjs-controller-as-syntax-clarification
            $scope.data = {
                appVerOri: '',
                appVerTest: '0.0.1',
                isCurrentVersion: true
            };

            $scope.data.appVerOri = serviceBundle.dataSharingService.get('test.appVerOri');
            if (!$scope.data.appVerOri) {
                $scope.data.appVerOri = protocolBundle.protocolConstant.APP.VER;
            }

            $scope.action = {
                changeLanguage: function() {
                    if (serviceBundle.languageService.getCurrentLanguage() == 'en') {
                        // Enforce to set 'zh' at runtime, which will affect all other pages from now on
                        serviceBundle.languageService.changeLanguage('zh');
                    } else {
                        serviceBundle.languageService.changeLanguage('en');
                    }
                },
                changeVersion: function() {
                    serviceBundle.dataSharingService.set('test.appVerOri', $scope.data.appVerOri);
                    protocolBundle.protocolConstant.APP.VER = $scope.data.appVerTest;
                },
                recoverVersion: function() {
                    var appVerOri = serviceBundle.dataSharingService.get('test.appVerOri');
                    if (!appVerOri) {
                        return;
                    }
                    $scope.data.appVerOri = appVerOri;
                    protocolBundle.protocolConstant.APP.VER = $scope.data.appVerOri;
                },
                testLoading: function() {
                    serviceBundle.promptService.loadingBar.start();
                    serviceBundle.promptService.loading.show({
                        message: 'TEST.CONTENT.TEST_LOADING_MESSAGE',
                        callback: function() {
                            serviceBundle.logService.log("loading hide");
                        },
                        showCloseIcon: true
                    });
                    $timeout(function() {
                        serviceBundle.promptService.loadingBar.set(0.5);
                        serviceBundle.promptService.loading.show();
                        $timeout(function() {
                            serviceBundle.promptService.loadingBar.complete();
                            serviceBundle.promptService.loading.hide();
                        }, 2500);
                    }, 10000);
                }
            }

            $ionicModal.fromTemplateUrl('mod-test-modal.html', {
                scope: $scope, // modal has the same $scope from this controller.
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.modal = modal; // bind this modal to $scope.
            });
            // Some action api capsulation, you can also use $scope.modal.xxx directly.
            $scope.openModal = function() {
                $scope.modal.show();
                if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                    // Refer to: http://ionicframework.com/docs/api/page/keyboard/
                    // If the content of your app (including the header) is being pushed up and
                    // out of view on input focus, try setting cordova.plugins.Keyboard.disableScroll(true).
                    // This does not disable scrolling in the Ionic scroll view, rather it
                    // disables the native overflow scrolling that happens automatically as a
                    // result of focusing on inputs below the keyboard.
                    cordova.plugins.Keyboard.disableScroll(true);
                }
            };
            $scope.closeModal = function() {
                $scope.modal.hide();
                if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.disableScroll(false);
                }
            };

            // Execute action on hide modal
            $scope.$on('modal.hidden', function() {
                // Execute action
            });
            // Execute action on remove modal
            $scope.$on('modal.removed', function() {
                // Execute action
            });

            function unloadedCallback() {
                // Cleanup the modal when we're done with it!
                if ($scope.modal) {
                    $scope.modal.remove();
                }
            }
        }
    ])

    .controller('testDetailCtrl', ['serviceBundle', 'utilBundle', 'protocolBundle', '$scope', 'testUtil',
        function(serviceBundle, utilBundle, protocolBundle, $scope, testUtil) {
            serviceBundle.modService.initMod($scope, {
                enter: testUtil.enterCallback,
                beforeLeave: testUtil.beforeLeaveCallback
            }, true);

            // NOTICE: Here $scope is the brother of $scope in `testCtrl`, not child!
            //         You can refer to mod.html for their relationship.
            $scope.data = {
                input: serviceBundle.linkService.getModParams().say
            };

            $scope.action = {
                submit: function() {
                    serviceBundle.logService.log($scope.data.input);
                    alert('Got the input: ' + $scope.data.input);
                }
            }
        }
    ])

    .controller('testTemplateCtrl', ['serviceBundle', 'utilBundle', 'protocolBundle', '$scope', 'testUtil',
        function(serviceBundle, utilBundle, protocolBundle, $scope, testUtil) {
            serviceBundle.modService.initMod($scope, {
                enter: testUtil.enterCallback,
                beforeLeave: testUtil.beforeLeaveCallback
            }, true);
        }
    ])

})();

