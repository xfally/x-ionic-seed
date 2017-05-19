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
                .state('test-ftp', {
                    url: '/test-ftp',
                    templateUrl: 'mod-test-ftp.html',
                    controller: 'testFtpCtrl'
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

    .controller('testFtpCtrl', ['serviceBundle', 'utilBundle', 'protocolBundle', '$scope', 'testUtil', '$ionicPlatform', '$window', '$q',
        function(serviceBundle, utilBundle, protocolBundle, $scope, testUtil, $ionicPlatform, $window, $q) {
            serviceBundle.modService.initMod($scope, {
                enter: testUtil.enterCallback,
                beforeLeave: testUtil.beforeLeaveCallback
            }, true);

            var loglog = '';
            var ftpPromiseUtil = {
                // Check plugin exist
                available: function() {
                    var deferred = $q.defer();
                    if ($window.cordova && $window.cordova.plugin && $window.cordova.plugin.ftp) {
                        serviceBundle.logService.info("xtest: ftp: plugin ready");
                        serviceBundle.promptService.loading.show(loglog += '\n' + 'plugin ready.', undefined, true);
                        deferred.resolve(true);
                    } else {
                        serviceBundle.logService.error("xtest: ftp: plugin not found!");
                        serviceBundle.promptService.loading.show(loglog += '\n' + 'plugin not found!', undefined, true);
                        deferred.reject(false);
                    }
                    return deferred.promise;
                },
                // Connect to one ftp server, then you can do any actions/cmds
                connect: function(address, username, password) {
                    serviceBundle.promptService.loading.show(loglog += '\n' + 'test connect...', undefined, true);
                    var deferred = $q.defer();
                    $window.cordova.plugin.ftp.connect(address, username, password, function(ok) {
                        serviceBundle.logService.info("xtest: ftp: connect ok");
                        serviceBundle.promptService.loading.show(loglog += '\n' + 'connect ok.', undefined, true);
                        deferred.resolve(ok);
                    }, function(error) {
                        serviceBundle.logService.error("xtest: ftp: connect error=" + error);
                        serviceBundle.promptService.loading.show(loglog += '\n' + 'connect error=' + error, undefined, true);
                        deferred.reject(error);
                    })
                    return deferred.promise;
                },
                // List one dir, note that it can just be dir, not file
                ls: function(remotePath) {
                    serviceBundle.promptService.loading.show(loglog += '\n' + 'test list...', undefined, true);
                    var deferred = $q.defer();
                    $window.cordova.plugin.ftp.ls(remotePath, function(fileList) {
                        serviceBundle.logService.info("xtest: ftp: list ok");
                        serviceBundle.promptService.loading.show(loglog += '\n' + 'list ok.', undefined, true);
                        if (fileList && fileList.length > 0) {
                            serviceBundle.logService.debug("xtest: ftp: the last file'name is " + fileList[fileList.length - 1].name);
                            serviceBundle.logService.debug("xtest: ftp: the last file'type is " + fileList[fileList.length - 1].type);
                            serviceBundle.logService.debug("xtest: ftp: the last file'link is " + fileList[fileList.length - 1].link);
                            serviceBundle.logService.debug("xtest: ftp: the last file'size is " + fileList[fileList.length - 1].size);
                            serviceBundle.logService.debug("xtest: ftp: the last file'modifiedDate is " + fileList[fileList.length - 1].modifiedDate);
                        }
                        deferred.resolve(fileList);
                    }, function(error) {
                        serviceBundle.logService.error("xtest: ftp: list error=" + error);
                        serviceBundle.promptService.loading.show(loglog += '\n' + 'list error=' + error, undefined, true);
                        deferred.reject(error);
                    })
                    return deferred.promise;
                },
                // Create one dir on ftp server, fail if a same named dir exists
                mkdir: function(remotePath) {
                    serviceBundle.promptService.loading.show(loglog += '\n' + 'test mkdir...', undefined, true);
                    var deferred = $q.defer();
                    $window.cordova.plugin.ftp.mkdir(remotePath, function(ok) {
                        serviceBundle.logService.info("xtest: ftp: mkdir ok=" + ok);
                        serviceBundle.promptService.loading.show(loglog += '\n' + 'mkdir ok.', undefined, true);
                        deferred.resolve(ok);
                    }, function(error) {
                        serviceBundle.logService.error("xtest: ftp: mkdir error=" + error);
                        serviceBundle.promptService.loading.show(loglog += '\n' + 'mkdir error=' + error, undefined, true);
                        deferred.reject(error);
                    })
                    return deferred.promise;
                },
                // Upload localFile to remote (you can rename at the same time). arg1: localFile, arg2: remoteFile
                upload: function(localFile, remoteFile) {
                    serviceBundle.promptService.loading.show({
                        message: loglog += '\n' + 'test upload...',
                        showCloseIcon: true,
                        callback: function() {
                            ftpPromiseUtil.cancel().then(function(ok) {
                                serviceBundle.promptService.loadingBar.complete();
                            }, function(error) {
                                serviceBundle.promptService.loadingBar.complete();
                            });
                        }
                    });
                    serviceBundle.promptService.loadingBar.start();
                    var deferred = $q.defer();
                    $window.cordova.plugin.ftp.upload(localFile, remoteFile, function(percent) {
                        if (percent == 1) {
                            serviceBundle.logService.info("xtest: ftp: upload finish");
                            serviceBundle.promptService.loading.show(loglog += '\n' + 'upload finish.', undefined, true);
                            serviceBundle.promptService.loadingBar.complete();
                            deferred.resolve(percent);
                        } else {
                            serviceBundle.logService.debug("xtest: ftp: upload percent=" + percent * 100 + "%");
                            serviceBundle.promptService.loadingBar.set(percent);
                            deferred.notify(percent);
                        }
                    }, function(error) {
                        serviceBundle.logService.error("xtest: ftp: upload error=" + error);
                        serviceBundle.promptService.loading.show(loglog += '\n' + 'upload error=' + error, undefined, true);
                        serviceBundle.promptService.loadingBar.complete();
                        deferred.reject(error);
                    })
                    return deferred.promise;
                },
                // Download remoteFile to local (you can rename at the same time). arg1: localFile, arg2: remoteFile
                download: function(localFile, remoteFile) {
                    serviceBundle.promptService.loading.show({
                        message: loglog += '\n' + 'test download...',
                        showCloseIcon: true,
                        callback: function() {
                            $window.cordova.plugin.ftp.cancel(function(ok) {
                                serviceBundle.promptService.loadingBar.complete();
                            }, function(error) {
                                serviceBundle.promptService.loadingBar.complete();
                            });
                        }
                    });
                    serviceBundle.promptService.loadingBar.start();
                    var deferred = $q.defer();
                    $window.cordova.plugin.ftp.download(localFile, remoteFile, function(percent) {
                        if (percent == 1) {
                            serviceBundle.logService.info("xtest: ftp: download finish");
                            serviceBundle.promptService.loading.show(loglog += '\n' + 'download finish.', undefined, true);
                            serviceBundle.promptService.loadingBar.complete();
                            deferred.resolve(percent);
                        } else {
                            serviceBundle.logService.debug("xtest: ftp: download percent=" + percent * 100 + "%");
                            serviceBundle.promptService.loadingBar.set(percent);
                            deferred.notify(percent);
                        }
                    }, function(error) {
                        serviceBundle.logService.error("xtest: ftp: download error=" + error);
                        serviceBundle.promptService.loading.show(loglog += '\n' + 'download error=' + error, undefined, true);
                        serviceBundle.promptService.loadingBar.complete();
                        deferred.reject(error);
                    })
                    return deferred.promise;
                },
                // Delete one file on ftp server
                rm: function(remoteFile) {
                    serviceBundle.promptService.loading.show(loglog += '\n' + 'test rm...', undefined, true);
                    var deferred = $q.defer();
                    $window.cordova.plugin.ftp.rm(remoteFile, function(ok) {
                        serviceBundle.logService.info("xtest: ftp: rm ok=" + ok);
                        serviceBundle.promptService.loading.show(loglog += '\n' + 'rm ok.', undefined, true);
                        deferred.resolve(ok);
                    }, function(error) {
                        serviceBundle.logService.error("xtest: ftp: rm error=" + error);
                        serviceBundle.promptService.loading.show(loglog += '\n' + 'rm error=' + error, undefined, true);
                        deferred.reject(error);
                    })
                    return deferred.promise;
                },
                // Delete one dir on ftp server, fail if it's not an empty dir
                rmdir: function(remotePath) {
                    serviceBundle.promptService.loading.show(loglog += '\n' + 'test rmdir...', undefined, true);
                    var deferred = $q.defer();
                    $window.cordova.plugin.ftp.rmdir(remotePath, function(ok) {
                        serviceBundle.logService.info("xtest: ftp: rmdir ok=" + ok);
                        serviceBundle.promptService.loading.show(loglog += '\n' + 'rmdir ok.', undefined, true);
                        deferred.resolve(ok);
                    }, function(error) {
                        serviceBundle.logService.error("xtest: ftp: rmdir error=" + error);
                        serviceBundle.promptService.loading.show(loglog += '\n' + 'rmdir error=' + error, undefined, true);
                        deferred.reject(error);
                    })
                    return deferred.promise;
                },
                // Cancel action
                cancel: function(path) {
                    serviceBundle.promptService.loading.show(loglog += '\n' + 'test cancel...', undefined, true);
                    var deferred = $q.defer();
                    $window.cordova.plugin.ftp.cancel(function(ok) {
                        serviceBundle.logService.info("xtest: ftp: cancel ok=" + ok);
                        serviceBundle.promptService.loading.show(loglog += '\n' + 'cancel ok.', undefined, true);
                        deferred.resolve(ok);
                    }, function(error) {
                        serviceBundle.logService.error("xtest: ftp: cancel error=" + error);
                        serviceBundle.promptService.loading.show(loglog += '\n' + 'cancel error=' + error, undefined, true);
                        deferred.reject(error);
                    })
                    return deferred.promise;
                },
                // Disconnect from ftp server explicitly
                disconnect: function() {
                    serviceBundle.promptService.loading.show(loglog += '\n' + 'test disconnect...', undefined, true);
                    var deferred = $q.defer();
                    $window.cordova.plugin.ftp.disconnect(function(ok) {
                        serviceBundle.logService.info("xtest: ftp: disconnect ok=" + ok);
                        serviceBundle.promptService.loading.show(loglog += '\n' + 'disconnect ok.', undefined, true);
                        deferred.resolve(ok);
                    }, function(error) {
                        serviceBundle.logService.error("xtest: ftp: disconnect error=" + error);
                        serviceBundle.promptService.loading.show(loglog += '\n' + 'disconnect error=' + error, undefined, true);
                        deferred.reject(error);
                    })
                    return deferred.promise;
                }
            };

            $scope.data = {
                ftp: {
                    ADDRESS: '192.168.1.109',
                    USERNAME: 'anonymous',
                    PASSWORD: 'anonymous@',
                    HOME_PATH: '/pub/'
                },
                remote: {
                    PATH: '/pub/testFtpDir/'
                },
                local: {
                    FILE: '/sdcard/xxx/sample.mp4'
                }
            };

            $scope.action = {
                testFtp: function() {
                    var FTP = {
                        ADDRESS: $scope.data.ftp.ADDRESS,
                        USERNAME: $scope.data.ftp.USERNAME,
                        PASSWORD: $scope.data.ftp.PASSWORD,
                        HOME_PATH: $scope.data.ftp.HOME_PATH
                    };
                    var localFile = $scope.data.local.FILE;
                    var localFileCopy = localFile + '.copy';
                    var remotePath = $scope.data.remote.PATH;
                    if (remotePath.substr(-1) != '/') {
                        remotePath += '/';
                    }
                    var remoteFile = remotePath + localFile.substr(localFile.lastIndexOf('/') + 1);
                    serviceBundle.logService.debug("xtest: remotePath is " + remotePath);
                    serviceBundle.logService.debug("xtest: remoteFile is " + remoteFile);
                    serviceBundle.logService.debug("xtest: localFile is " + localFile);
                    serviceBundle.logService.debug("xtest: localFileCopy is " + localFileCopy);

                    loglog = '';
                    serviceBundle.promptService.loading.show(loglog += 'Test Ftp plugin: start...', undefined, true);
                    $ionicPlatform.ready(function() {
                        ftpPromiseUtil.available().then(function() {
                            ftpPromiseUtil.connect(FTP.ADDRESS, FTP.USERNAME, FTP.PASSWORD).then(function(ok) {
                                ftpPromiseUtil.ls(FTP.HOME_PATH).then(function(fileList) {
                                    ftpPromiseUtil.mkdir(remotePath).then(function(ok) {
                                        ftpPromiseUtil.upload(localFile, remoteFile).then(function(percent) {
                                            ftpPromiseUtil.download(localFileCopy, remoteFile).then(function(percent) {
                                                ftpPromiseUtil.rm(remoteFile).then(function(ok) {
                                                    ftpPromiseUtil.rmdir(remotePath).then(function(ok) {
                                                        ftpPromiseUtil.disconnect().then(function(ok) {
                                                            serviceBundle.promptService.loading.show(loglog += '\n' + 'All test pass!', undefined, true);
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                }
            }
        }
    ])

})();

