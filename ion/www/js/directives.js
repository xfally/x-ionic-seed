(function() {
    'use strict';

    /**
     * @description
     * Afford multi-base-directives.
     *
     * @ngdoc overview
     * @name directive
     * @requires util
     */
    angular.module('directive', ['util'])

    /**
     * @description
     * The directive to check login username valid.
     *
     * Use `check-login-username` in `<input>` and `checkLoginUsername` in `<div ng-message>`.
     *
     * @memberof directive
     * @ngdoc directive
     * @name checkLoginUsername
     * @requires checkUtil
     */
    .directive('checkLoginUsername', ['checkUtil',
        function(checkUtil) {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function(scope, elm, attrs, ctrl) {
                    ctrl.$validators.checkLoginUsername = function(modelValue, viewValue) {
                        if (checkUtil.login.username.valid(viewValue)) {
                            return true;
                        } else {
                            return false;
                        }
                    };
                }
            };
        }
    ])

    /**
     * @description
     * The directive to check login password valid.
     *
     * Use `check-login-password` in `<input>` and `checkLoginPassword` in `<div ng-message>`.
     *
     * @memberof directive
     * @ngdoc directive
     * @name checkLoginPassword
     * @requires checkUtil
     */
    .directive('checkLoginPassword', ['checkUtil',
        function(checkUtil) {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function(scope, elm, attrs, ctrl) {
                    ctrl.$validators.checkLoginPassword = function(modelValue, viewValue) {
                        if (checkUtil.login.password.valid(viewValue)) {
                            return true;
                        } else {
                            return false;
                        }
                    };
                }
            };
        }
    ])

    /**
     * @description
     * The directive to check phone number valid.
     *
     * Use `check-phone-number` in `<input>` and `checkPhoneNumber` in `<div ng-message>`.
     *
     * @memberof directive
     * @ngdoc directive
     * @name checkPhoneNumber
     * @requires checkUtil
     */
    .directive('checkPhoneNumber', ['checkUtil',
        function(checkUtil) {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function(scope, elm, attrs, ctrl) {
                    ctrl.$validators.checkPhoneNumber = function(modelValue, viewValue) {
                        if (checkUtil.network.isPhoneNumber(viewValue)) {
                            return true;
                        } else {
                            return false;
                        }
                    };
                }
            }
        }
    ])

    /**
     * @description
     * The directive to check pin valid.
     *
     * Use `check-network-pin` in `<input>` and `checkNetworkPIN` in `<div ng-message>`.
     *
     * @memberof directive
     * @ngdoc directive
     * @name checkNetworkPin
     * @requires checkUtil
     */
    .directive('checkNetworkPin', ['checkUtil',
        function(checkUtil) {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function(scope, elm, attrs, ctrl) {
                    ctrl.$validators.checkNetworkPIN = function(modelValue, viewValue) {
                        if (checkUtil.network.isPin(viewValue)) {
                            return true;
                        } else {
                            return false;
                        }
                    };
                }
            }
        }
    ])

    /**
     * @description
     * The directive to check puk valid.
     *
     * Use `check-network-puk` in `<input>` and `checkNetworkPUK` in `<div ng-message>`.
     *
     * @memberof directive
     * @ngdoc directive
     * @name checkNetworkPuk
     * @requires checkUtil
     */
    .directive('checkNetworkPuk', ['checkUtil',
        function(checkUtil) {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function(scope, elm, attrs, ctrl) {
                    ctrl.$validators.checkNetworkPUK = function(modelValue, viewValue) {
                        if (checkUtil.network.isPuk(viewValue)) {
                            return true;
                        } else {
                            return false;
                        }
                    };
                }
            }
        }
    ])

    /**
     * @description
     * The directive to check profile name valid.
     *
     * Use `check-network-profile-name` in `<input>` and `checkNetworkProfileName` in `<div ng-message>`.
     *
     * @memberof directive
     * @ngdoc directive
     * @name checkNetworkProfileName
     * @requires checkUtil
     */
    .directive('checkNetworkProfileName', ['checkUtil',
        function(checkUtil) {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function(scope, elm, attrs, ctrl) {
                    ctrl.$validators.checkNetworkProfileName = function(modelValue, viewValue) {
                        if (checkUtil.network.isProfileName(viewValue)) {
                            return true;
                        } else {
                            return false;
                        }
                    };
                }
            }
        }
    ])

    /**
     * @description
     * The directive to check profile valid.
     *
     * Use `check-network-profile` in `<input>` and `checkNetworkProfile` in `<div ng-message>`.
     *
     * @memberof directive
     * @ngdoc directive
     * @name checkNetworkProfile
     * @requires checkUtil
     */
    .directive('checkNetworkProfile', ['checkUtil',
        function(checkUtil) {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function(scope, elm, attrs, ctrl) {
                    ctrl.$validators.checkNetworkProfile = function(modelValue, viewValue) {
                        if (checkUtil.network.isProfile(viewValue)) {
                            return true;
                        } else {
                            return false;
                        }
                    };
                }
            }
        }
    ])

    /**
     * @description
     * The directive to check mac valid.
     *
     * Use `check-wlan-mac` in `<input>` and `checkWlanMAC` in `<div ng-message>`.
     *
     * @memberof directive
     * @ngdoc directive
     * @name checkWlanMac
     * @requires checkUtil
     */
    .directive('checkWlanMac', ['checkUtil',
        function(checkUtil) {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function(scope, elm, attrs, ctrl) {
                    ctrl.$validators.checkWlanMAC = function(modelValue, viewValue) {
                        if (checkUtil.wlan.isMac(viewValue)) {
                            return true;
                        } else {
                            return false;
                        }
                    };
                }
            }
        }
    ])

    /**
     * @description
     * The directive to check ssid valid.
     *
     * Use `check-wlan-ssid` in `<input>` and `checkWlanSSID` in `<div ng-message>`.
     *
     * @memberof directive
     * @ngdoc directive
     * @name checkWlanSsid
     * @requires checkUtil
     */
    .directive('checkWlanSsid', ['checkUtil',
        function(checkUtil) {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function(scope, elm, attrs, ctrl) {
                    ctrl.$validators.checkWlanSSID = function(modelValue, viewValue) {
                        if (checkUtil.wlan.isSSID(viewValue)) {
                            return true;
                        } else {
                            return false;
                        }
                    };
                }
            };
        }
    ])

    /**
     * @description
     * The directive to check wlan password valid.
     *
     * Use `check-wlan-password` in `<input>` and `checkWlanPassword` in `<div ng-message>`.
     *
     * @memberof directive
     * @ngdoc directive
     * @name checkWlanPassword
     * @requires checkUtil
     */
    .directive('checkWlanPassword', ['checkUtil',
        function(checkUtil) {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function(scope, elm, attrs, ctrl) {
                    ctrl.$validators.checkWlanPassword = function(modelValue, viewValue) {
                        if (checkUtil.wlan.isPassword(viewValue)) {
                            return true;
                        } else {
                            return false;
                        }
                    };
                }
            };
        }
    ])

    /**
     * @description
     * The directive to check directory name valid.
     *
     * Use `check-directory-name` in `<input>` and `checkDirectoryName` in `<div ng-message>`.
     *
     * @memberof directive
     * @ngdoc directive
     * @name checkDirectoryName
     * @requires checkUtil
     */
    .directive('checkDirectoryName', ['checkUtil',
        function(checkUtil) {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function(scope, elm, attrs, ctrl) {
                    ctrl.$validators.checkDirectoryName = function(modelValue, viewValue) {
                        if (checkUtil.file.isDirectoryName(viewValue)) {
                            return true;
                        } else {
                            return false;
                        }
                    };
                }
            };
        }
    ])

})();

