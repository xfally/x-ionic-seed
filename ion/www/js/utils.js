(function() {
    'use strict';

    /**
     * @description
     * Afford multi-base-utils.
     *
     * @ngdoc overview
     * @name util
     */
    angular.module('util', [])

    /**
     * @description
     * Util constant.
     *
     * @memberof util
     */
    .constant('utilConstant', {
        CUT_BIT: 1, // e.g. 987654321.123456789 --> 987654321.1
        FIX_BIT: 6 // e.g. 987654321.123456789 --> 987654321.123457 (round)
    })

    /**
     * @description
     * Util value.
     *
     * @memberof util
     */
    .value('utilValue', {})

    /**
     * @description
     * Init data.
     *
     * @memberof util
     * @ngdoc service
     * @name initUtil
     */
    .factory('initUtil', [

        function() {
            /**
             * @description
             * Init all obj members as val, by recursion.
             *
             * @memberof initUtil
             * @param {object} obj Any js object to be inited
             * @param {object} val Any js value to init
             * @returns {object} The object after inited.
             */
            var initVal = function(obj, val) {
                if (!val) {
                    return;
                }
                if (!angular.isObject(obj)) {
                    obj = val;
                    return obj;
                }
                var ret;
                if (angular.isArray(obj)) {
                    ret = [];
                } else {
                    ret = {};
                }
                for (var i in obj) {
                    ret[i] = initVal(obj[i], val);
                }
                return ret;
            }

            /**
             * @description
             * Init all obj members as "loading", which is used to mean the data is loading...
             *
             * TODO: Support i18n string.
             *
             * @memberof initUtil
             * @param {object} obj Any js object to be inited
             * @returns {object} The object after inited as "Loading".
             */
            var initLoading = function(obj) {
                return initVal(obj, "Loading");
            }

            return {
                initVal: initVal,
                initLoading: initLoading
            }
        }
    ])

    /**
     * @description
     * Sort data.
     *
     * @memberof util
     * @ngdoc service
     * @name sortUtil
     */
    .factory('sortUtil', [

        function() {
            /**
             * @description
             * Sort one object array by one object's key/value.
             *
             * @example
             * var array = [
             *     {name: "Wang Er", age: 18},
             *     {name: "Li Si", age: 28},
             *     {name: "A Xing", age: 8},
             * ];
             * var newArray = sortObjArray(array, "name"); // "A Xing", "Li Si", "Wang Er".
             * var newArray2 = sortObjArray(array, "age"); // "A Xing", "Wang Er", "Li Si".
             *
             * @memberof sortUtil
             * @param {object} oArray One object array.
             * @param {object} oKey One object's key name.
             * @returns {boolean} One new array sorted.
             */
            var sortObjArray = function(oArray, oKey) {
                if (!angular.isArray(oArray) || !angular.isString(oKey)) {
                    return oArray;
                }
                return oArray.sort(function(a, b) {
                    return a[oKey].localeCompare(b[oKey]);
                });
            }

            return {
                sortObjArray: sortObjArray
            }
        }
    ])

    /**
     * @description
     * Diff data.
     *
     * @memberof util
     * @ngdoc service
     * @name diffUtil
     */
    .factory('diffUtil', [

        function() {
            /**
             * @description
             * Two data (object or value) are all equal?
             *
             * @memberof diffUtil
             * @param {object} oa Any js object or value.
             * @param {object} ob Any js object or value.
             * @returns {boolean} The two object are equal?
             */
            var isAllEqual = function(oa, ob) {
                if (typeof oa !== typeof ob) {
                    return false;
                }
                if (typeof oa !== 'object') {
                    return oa === ob;
                }
                for (var i in oa) {
                    if (!isAllEqual(oa[i], ob[i])) {
                        return false;
                    }
                }
                return true;
            }

            /**
             * @description
             * Compare two version string.
             *
             * WARNING: This code uses Array.map and Array.every, which means that it will not run in IE versions earlier than 9.
             *
             * @example
             * diffUtil.compareVersion('1.0.0', '1.1.0', {zeroExtend: true});  // return `-1`
             * diffUtil.compareVersion('1.0.0', '1.0', {zeroExtend: true});  // return `0`
             *
             * @memberof diffUtil
             * @param {object} v1 The first version string.
             * @param {object} v2 The second version string.
             * @param {object} options The config options.
             * @returns {number} `-1` means less than, `0` means equal, `1` means bigger than.
             */
            var compareVersion = function(v1, v2, options) {
                var lexicographical = options && options.lexicographical,
                    zeroExtend = options && options.zeroExtend,
                    v1parts = v1.split('.'),
                    v2parts = v2.split('.');

                function isValidPart(x) {
                    return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
                }

                if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
                    return NaN;
                }

                if (zeroExtend) {
                    while (v1parts.length < v2parts.length) {
                        v1parts.push("0");
                    }
                    while (v2parts.length < v1parts.length) {
                        v2parts.push("0");
                    }
                }

                if (!lexicographical) {
                    v1parts = v1parts.map(Number);
                    v2parts = v2parts.map(Number);
                }

                for (var i = 0; i < v1parts.length; ++i) {
                    if (v2parts.length == i) {
                        return 1;
                    }

                    if (v1parts[i] == v2parts[i]) {
                        continue;
                    } else if (v1parts[i] > v2parts[i]) {
                        return 1;
                    } else {
                        return -1;
                    }
                }

                if (v1parts.length != v2parts.length) {
                    return -1;
                }

                return 0;
            }

            return {
                isAllEqual: isAllEqual,
                compareVersion: compareVersion
            }
        }
    ])

    /**
     * @description
     * Check data valid.
     *
     * @memberof util
     * @ngdoc service
     * @name checkUtil
     */
    .factory('checkUtil', [

        function() {
            /**
             * @description
             * Check (login) username valid.
             *
             * Valid: Username must be 6 to 15 characters long, including letters, numbers, dashes and underlines.
             *
             * @memberof checkUtil
             * @alias login.username.valid
             * @param {string} username username string
             * @returns {boolean} valid or not.
             */
            var checkLoginUsernameValid = function(username) {
                var reg = /^[A-Za-z0-9-_]+$/;
                return reg.test(username);
            }

            /**
             * @description
             * Check (login) password valid.
             *
             * Valid: Password must be 6 to 15 characters long, including letters, numbers, dashes and underlines.
             *
             * @memberof checkUtil
             * @alias login.password.valid
             * @param {string} password password string
             * @returns {boolean} valid or not.
             */
            var checkLoginPasswordValid = function(password) {
                var reg = /^[A-Za-z0-9-_]+$/;
                return reg.test(password) && checkLoginPasswordLength(password);
            }

            /**
             * @description
             * Check (login) password length.
             *
             * Valid: 6 <= password.length <= 15
             *
             * @memberof checkUtil
             * @alias loginPassword.lengthValid
             * @param {string} password password string
             * @returns {boolean} valid or not.
             */
            var checkLoginPasswordLength = function(password) {
                if (password && password.length >= 6 && password.length <= 15) {
                    return true;
                } else {
                    return false;
                }
            }

            /**
             * @description
             * Check (login) password strength.
             *
             * ```
             * +--------------+--------+----------+
             * |    mixed     | length | strength |
             * +--------------+--------+----------+
             * | 3/4 kinds in |        |          |
             * | letters,     |        |          |
             * | numbers,     |        |          |
             * | dashes,      |  >=6   |     3    |
             * | underlines   |        |          |
             * +--------------+--------+----------+
             * | 2 kinds in   |   >10  |     3    |
             * | letters,     |        |          |
             * | numbers,     +--------+----------+
             * | dashes,      |  <=10  |     2    |
             * | underlines   |        |          |
             * +--------------+--------+----------+
             * | 1 kind in    |   >10  |     2    |
             * | letters,     |        |          |
             * | numbers,     +--------+----------+
             * | dashes,      |  <=10  |     1    |
             * | underlines   |        |          |
             * +--------------+--------+----------+
             * ```
             *
             * @memberof checkUtil
             * @alias loginPassword.strength
             * @param {string} password password string
             * @returns {number} password strength.
             */
            var checkLoginPasswordStrength = function(password) {
                if (!password) {
                    return 1;
                }

                var hasNum = /\d/.test(password),
                    hasUpper = /[A-Z]/.test(password),
                    hasLower = /[a-z]/.test(password),
                    hasSign = /[-_]/.test(password),
                    score = Number(hasNum) + Number(hasUpper) + Number(hasLower) + Number(hasSign) + Number(password.length > 10 ? 1 : 0);

                if (score >= 3) {
                    return 3;
                } else if (score === 2) {
                    return 2;
                } else {
                    return 1;
                }

            }

            /**
             * @description
             * Check phone number.
             *
             * Valid: digits or '+' at head
             *
             * @memberof checkUtil
             * @alias network.isPhoneNumber
             * @param {string} phoneNumber Phone number
             * @returns {boolean} valid or not.
             */
            var checkPhoneNumberValid = function(phoneNumber) {
                return /^(0607|120609)\+/.test(phoneNumber) || /^\+?\d*$/.test(phoneNumber);
            }

            /**
             * @description
             * Check PIN valid.
             *
             * Valid: 4 to 8 digits
             *
             * @memberof checkUtil
             * @alias network.isPin
             * @param {string} pin PIN
             * @returns {boolean} valid or not.
             */
            var checkPinValid = function(pin) {
                var reg = /^[0-9]{4,8}$/;
                return reg.test(pin);
            }

            /**
             * @description
             * Check PUK valid.
             *
             * Valid: 8 digits
             *
             * @memberof checkUtil
             * @alias network.isPuk
             * @param {string} puk PUK
             * @returns {boolean} valid or not.
             */
            var checkPukValid = function(puk) {
                var reg = /^[0-9]{8}$/;
                return reg.test(puk);
            }

            /**
             * @description
             * Check profile name valid.
             *
             * Valid: string ends with no '(D)'
             *
             * @memberof checkUtil
             * @alias network.isProfileName
             * @param {string} str Profile name
             * @returns {boolean} valid or not
             */
            var checkProfileNameValid = function(str) {
                var reg = /\(D\)$/;
                return str && !reg.test(str);
            }

            /**
             * @description
             * Check profile parameters valid.
             *
             * Valid: string contains no "'", """, " "
             *
             * @memberof checkUtil
             * @alias network.isProfile
             * @param {string} str Profile paramenters, eg: profileName, apn, username, password
             * @returns {boolean} valid or not
             */
            var checkProfileValid = function(str) {
                if (!str) { // allow username and password empty
                    return true;
                }
                var reg1 = /^[^'" ]+$/,
                    reg2 = /^[\x20-\x7e]+$/g;
                return reg1.test(str) && reg2.test(str);
            }

            /**
             * @description
             * Check MAC valid.
             *
             * Valid: xx-xx-xx-xx-xx-xx, x=[0-9a-f], and x can't be all 0 or f, also the second x can't be 1/3/5/7/9/b/d/f
             *
             * @memberof checkUtil
             * @alias wlan.isMac
             * @param {string} mac MAC
             * @returns {boolean} valid or not.
             */
            var checkMacValid = function(mac) {
                if (!mac) {
                    return false;
                }
                mac = mac.toLowerCase().replace(/:/g, '-');
                if (mac === '00-00-00-00-00-00' || mac === 'ff-ff-ff-ff-ff-ff') {
                    return false;
                }
                if (/[13579bdf]/.test(mac.charAt(1))) {
                    return false;
                }

                var reg = /^([\da-f]{2}-){5}[\da-f]{2}$/;
                return reg.test(mac);
            }

            /**
             * @description
             * Check wlan ssid valid.
             *
             * Valid: `1 <= length <= 32`, and are printable chars (`0x20 - 0x7e`).
             *
             * @memberof checkUtil
             * @alias wlan.isSSID
             * @param {string} str wlan's ssid
             * @returns {boolean} valid or not
             */
            var checkSSIDValid = function(str) {
                if (!str || str.length > 32) {
                    return false;
                }
                var reg = /^[\x20-\x7e]+$/g;
                return reg.test(str);
            }

            /**
             * @description
             * Check wlan password valid.
             *
             * Valid:
             * - If exist, must be `8 <= length <= 64`.
             * - If `length == 64`, allow `0-9，a-f, A-F`, else if `length < 64`, allow `0x20 - 0x7e`.
             * - If not exist, always return valid.
             *
             * @memberof checkUtil
             * @alias wlan.isPassword
             * @param {string} str wlan's password
             * @returns {boolean} valid or not
             */
            var checkWlanPasswordValid = function(str) {
                if (!str) { // allow blank password
                    return true;
                }
                if (str.length < 8 || str.length > 64) {
                    return false;
                }
                if (str.length === 64) {
                    return (/^[0-9a-fA-F]+$/).test(str);
                } else {
                    var reg = /^[\x20-\x7e]+$/g;
                    return reg.test(str);
                }
            }

            /**
             * @description
             * Check directory name valid.
             *
             * Valid: Not blank and not contains `/\:*?"<>|`.
             *
             * @memberof checkUtil
             * @alias file.isDirectoryName
             * @param {string} str Directory name
             * @returns {boolean} valid or not
             */
            var checkDirectoryNameValid = function(str) {
                if (!str) {
                    return false;
                }
                return !(/[/\\:*?\"<>|]+/).test(str);
            }

            return {
                login: {
                    username: {
                        valid: checkLoginUsernameValid
                    },
                    password: {
                        valid: checkLoginPasswordValid,
                        lengthValid: checkLoginPasswordLength,
                        strength: checkLoginPasswordStrength
                    }
                },
                network: {
                    isPhoneNumber: checkPhoneNumberValid,
                    isPin: checkPinValid,
                    isPuk: checkPukValid,
                    isProfileName: checkProfileNameValid,
                    isProfile: checkProfileValid
                },
                wlan: {
                    isMac: checkMacValid,
                    isSSID: checkSSIDValid,
                    isPassword: checkWlanPasswordValid
                },
                file: {
                    isDirectoryName: checkDirectoryNameValid
                }
            }
        }
    ])

    /**
     * @description
     * Cut or truncate data.
     *
     * @memberof util
     * @ngdoc service
     * @name cutUtil
     * @requires utilConstant
     */
    .factory('cutUtil', ['utilConstant',
        function(utilConstant) {
            /**
             * @description
             * Truncate bits after dot with no carry-bit, return a string.
             *
             * @example
             * num = 987654321.123456789, bits = 3 --> 987654321.123
             * num = 987654321.123456789, bits = 0 --> 987654321
             * num = 987654321.123456789, bits = -3 --> 987654321.12
             * num = 987654321, bits = 3 --> 987654321
             * num = 'asdf.asdf', bits = 3 --> 'asdf.asdf'
             *
             * @memberof cutUtil
             * @param {number} num The number needs to be truncated.
             * @param {number} bits The truncate bits.
             * @returns {string} The string after truncated.
             */
            var truncate = function(num, bits) {
                if (!angular.isNumber(num)) {
                    return num;
                }
                var str = num.toString(),
                    reg;
                if (!/\./.test(str)) {
                    return str;
                }
                if (!angular.isNumber(bits) || bits < 0) {
                    bits = utilConstant.CUT_BIT;
                } else if (bits === 0) {
                    return str.split('.')[0];
                }
                reg = new RegExp('^(\\d*\\.\\d{0,' + bits + '})\\d*$');
                return str.match(reg)[1] || '0';
            };

            return {
                truncate: truncate
            }
        }
    ])

    /**
     * @description
     * Process Date-Time, e.g. unit convert...
     *
     * @memberof util
     * @ngdoc service
     * @name dateTimeUtil
     * @requires utilConstant
     * @requires cutUtil
     */
    .factory('dateTimeUtil', ['utilConstant', 'cutUtil',
        function(utilConstant, cutUtil) {
            /**
             * @description
             * Convert seconds to [minutes, seconds] without unit.
             *
             * @memberof dateTimeUtil
             * @alias human.sec2min
             * @param {number} sec seconds
             * @returns {array} [minutes, seconds] converted from seconds. e.g. `[5, 20]` means 5minutes+20seconds.
             */
            var sec2min = function(sec) {
                if (!sec || !angular.isNumber(sec)) {
                    return 0;
                }
                var m = parseInt(sec / 60),
                    s = parseInt(sec - m * 60);
                return [m, s];
            }

            /**
             * @description
             * Convert seconds to [hours, minutes, seconds] without unit.
             *
             * @memberof dateTimeUtil
             * @alias human.sec2hour
             * @param {number} sec seconds
             * @returns {array} [hours, minutes, seconds] converted from seconds. e.g. `[30, 5, 20]` means 30hours+5minutes+20seconds.
             */
            var sec2hour = function(sec) {
                if (!sec || !angular.isNumber(sec)) {
                    return 0;
                }
                var h = parseInt(sec / 60 / 60),
                    m = parseInt((sec - h * 60 * 60) / 60),
                    s = parseInt(sec - h * 60 * 60 - m * 60);
                return [h, m, s];
            }

            /**
             * @description
             * Convert seconds to [days, hours, minutes, seconds] without unit.
             *
             * @memberof dateTimeUtil
             * @alias human.sec2day
             * @param {number} sec seconds
             * @returns {array} [days, hours, minutes, seconds] converted from seconds. e.g. `[5, 30, 5, 20]` means 5days+30hours+5minutes+20seconds.
             */
            var sec2day = function(sec) {
                if (!sec || !angular.isNumber(sec)) {
                    return 0;
                }
                var d = parseInt(sec / 60 / 60 / 24),
                    h = parseInt((sec - d * 60 * 60 * 24) / 60 / 60),
                    m = parseInt((sec - d * 60 * 60 * 24 - h * 60 * 60) / 60),
                    s = parseInt(sec - d * 60 * 60 * 24 - h * 60 * 60 - m * 60);
                return [d, h, m, s];
            }

            /**
             * @description
             * Convert second to minute without unit.
             *
             * @memberof dateTimeUtil
             * @param {number|string} ori A number or string number.
             * @returns {string} The string number after converted and truncated.
             */
            var secToMin = function(ori) {
                var sec = Number(ori);
                if (!sec) {
                    return '0';
                }
                return cutUtil.truncate(sec / 60, utilConstant.CUT_BIT);
            }

            /**
             * @description
             * Convert second to hour without unit.
             *
             * @memberof dateTimeUtil
             * @param {number|string} ori A number or string number.
             * @returns {string} The string number after converted and truncated.
             */
            var secToHour = function(ori) {
                var sec = Number(ori);
                if (!sec) {
                    return '0';
                }
                return cutUtil.truncate(sec / 60 / 60, utilConstant.CUT_BIT);
            }

            /**
             * @description
             * Convert second to day without unit.
             *
             * @memberof dateTimeUtil
             * @param {number|string} ori A number or string number.
             * @returns {string} The string number after converted and truncated.
             */
            var secToDay = function(ori) {
                var sec = Number(ori);
                if (!sec) {
                    return '0';
                }
                return cutUtil.truncate(sec / 60 / 60 / 24, utilConstant.CUT_BIT);
            }

            /**
             * @description
             * Convert minute to second without unit.
             *
             * @memberof dateTimeUtil
             * @param {number|string} ori A number or string number.
             * @returns {string} The string number after converted with fixed decimal bits.
             */
            var minToSec = function(ori) {
                var min = parseFloat(ori);
                if (!min) {
                    return '0';
                }
                return (min * 60).toFixed(utilConstant.FIX_BIT);
            }

            /**
             * @description
             * Convert hour to second without unit.
             *
             * @memberof dateTimeUtil
             * @param {number|string} ori A number or string number.
             * @returns {string} The string number after converted with fixed decimal bits.
             */
            var hourToSec = function(ori) {
                var hour = parseFloat(ori);
                if (!hour) {
                    return '0';
                }
                return (hour * 60 * 60).toFixed(utilConstant.FIX_BIT);
            }

            /**
             * @description
             * Convert day to second without unit.
             *
             * @memberof dateTimeUtil
             * @param {number|string} ori A number or string number.
             * @returns {string} The string number after converted with fixed decimal bits.
             */
            var dayToSec = function(ori) {
                var day = parseFloat(ori);
                if (!day) {
                    return '0';
                }
                return (day * 60 * 60 * 24).toFixed(utilConstant.FIX_BIT);
            }

            return {
                human: {
                    sec2min: sec2min,
                    sec2hour: sec2hour,
                    sec2day: sec2day
                },
                secToMin: secToMin,
                secToHour: secToHour,
                secToDay: secToDay,
                minToSec: minToSec,
                hourToSec: hourToSec,
                dayToSec: dayToSec
            }
        }
    ])

    /**
     * @description
     * Process flow. e.g. unit convert...
     *
     * @memberof util
     * @ngdoc service
     * @name flowUtil
     * @requires utilConstant
     * @requires cutUtil
     */
    .factory('flowUtil', ['utilConstant', 'cutUtil',
        function(utilConstant, cutUtil) {
            /**
             * @description
             * Convert Byte to GB without unit.
             *
             * @memberof flowUtil
             * @param {number|string} ori A number or string number.
             * @returns {string} The string number after converted and truncated.
             */
            var ByteToGB = function(ori) {
                var b = Number(ori);
                if (!b) {
                    return '0';
                }
                return cutUtil.truncate(b / 1024 / 1024 / 1024, utilConstant.CUT_BIT);
            }

            /**
             * @description
             * Convert Byte to MB without unit.
             *
             * @memberof flowUtil
             * @param {number|string} ori A number or string number.
             * @returns {string} The string number after converted and truncated.
             */
            var ByteToMB = function(ori) {
                var b = Number(ori);
                if (!b) {
                    return '0';
                }
                return cutUtil.truncate(b / 1024 / 1024, utilConstant.CUT_BIT);
            }

            /**
             * @description
             * Convert Byte to KB without unit.
             *
             * @memberof flowUtil
             * @param {number|string} ori A number or string number.
             * @returns {string} The string number after converted and truncated.
             */
            var ByteToKB = function(ori) {
                var b = Number(ori);
                if (!b) {
                    return '0';
                }
                return cutUtil.truncate(b / 1024, utilConstant.CUT_BIT);
            }

            /**
             * @description
             * Convert GB to Byte without unit.
             *
             * @memberof flowUtil
             * @param {number|string} ori A number or string number.
             * @returns {string} The string number after converted and truncated.
             */
            var GBToByte = function(ori) {
                var gb = parseFloat(ori);
                if (!gb) {
                    return '0';
                }
                return (gb * 1024 * 1024 * 1024).toFixed(utilConstant.FIX_BIT);
            }

            /**
             * @description
             * Convert MB to Byte without unit.
             *
             * @memberof flowUtil
             * @param {number|string} ori A number or string number.
             * @returns {string} The string number after converted and truncated.
             */
            var MBToByte = function(ori) {
                var mb = parseFloat(ori);
                if (!mb) {
                    return '0';
                }
                return (mb * 1024 * 1024).toFixed(utilConstant.FIX_BIT);
            }

            /**
             * @description
             * Convert KB to Byte without unit.
             *
             * @memberof flowUtil
             * @param {number|string} ori A number or string number.
             * @returns {string} The string number after converted and truncated.
             */
            var KBToByte = function(ori) {
                var kb = parseFloat(ori);
                if (!kb) {
                    return '0';
                }
                return (kb * 1024).toFixed(utilConstant.FIX_BIT);
            }

            return {
                ByteToGB: ByteToGB,
                ByteToMB: ByteToMB,
                ByteToKB: ByteToKB,
                GBToByte: GBToByte,
                MBToByte: MBToByte,
                KBToByte: KBToByte
            }
        }
    ])

    /**
     * @description
     * Util bundle.
     *
     * Bundle all utils into one util object.
     * Other module can depend on `utilBundle` and use any APIs under it, like `utilBundle.xxx.yyy()`.
     * Html can use `utilBundle.xxx.yyy()` directly as it has been exported to `$rootScope`.
     *
     * @example
     * utilBundle.checkUtil.checkLoginPasswordValid("123456");
     *
     * @memberof util
     * @ngdoc service
     * @name utilBundle
     * @requires $rootScope
     * @requires utilConstant
     * @requires utilValue
     * @requires initUtil
     * @requires diffUtil
     * @requires sortUtil
     * @requires checkUtil
     * @requires dateTimeUtil
     * @requires flowUtil
     */
    .factory('utilBundle', ['$rootScope', '$window', 'utilConstant', 'utilValue', 'initUtil', 'sortUtil', 'diffUtil', 'checkUtil', 'cutUtil', 'dateTimeUtil', 'flowUtil',
        function($rootScope, $window, utilConstant, utilValue, initUtil, sortUtil, diffUtil, checkUtil, cutUtil, dateTimeUtil, flowUtil) {
            var api = {
                utilConstant: utilConstant,
                utilValue: utilValue,
                initUtil: initUtil,
                sortUtil: sortUtil,
                diffUtil: diffUtil,
                checkUtil: checkUtil,
                cutUtil: cutUtil,
                dateTimeUtil: dateTimeUtil,
                flowUtil: flowUtil
            }

            // Export service to html
            $rootScope.utilBundle = api;
            // Export browser window
            $window.utilBundle = api;
            return api;
        }
    ])

})();

