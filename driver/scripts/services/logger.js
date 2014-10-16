'use strict';

angular.module('taxigoDriverApp')
    .factory('logger', [function () {
        /**
         * logger Factory
         *
         * @param {String} moduleName name of the module which will be logged
         * @param {boolean} disableLoginfo disable the info log or not
         * @param {boolean} disableLogerror disable the error log or not
         */

        var _stringify = function (args) {
            var msg = '';

            for (var i = 0; i < args.length; i++) {
                var item = args[i];

                if (angular.isString(item)) {
                    msg += item;
                } else {
                    msg += JSON.stringify(item, null, '\t') + ' ';
                }
            }

            return msg;
        };

        var _getDateTimeStr = function () {
            var date = new Date();
            var dateStr = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
            var timeStr = date.toLocaleTimeString();
            var result = dateStr + ' ' + timeStr;

            return result;
        };

        var _log = function (logLevel, args) {
            if (this.disableLog[logLevel]) {
                return false;
            }

            var separator = ' - ';
            var separatorParam = ': ';

            var moduleName = this.moduleName;
            var functionName = args[0];
            var paramDisplay = args[1];

            args.splice(0, 1); //delete first element;
            args.splice(0, 1); //delete second element;

            var content = _stringify(args);
            var msg = _getDateTimeStr() + separator + moduleName + separator + functionName + separator + paramDisplay + separatorParam + content;

            console[this.functionName[logLevel]](msg);
        };


        return {
            moduleName: 'NO MODULE',

            disableLog: { info: false, error: false, debug: false},

            functionName: {info: 'info', error: 'error', debug: 'debug'},

            /**
             * log the messages into Info logging
             *
             * @param {String} functionName name of the function need to log
             * @param {String} displayParam the param need to display
             * @param {Array} theValues the values that need to display
             */
            info: function () {
                var args = Array.prototype.slice.call(arguments, 0);

                angular.bind(this, _log, 'info', args)();
            },

            /**
             * log the messages into Error logging
             *
             * @param {String} functionName name of the function need to log
             * @param {String} displayParam the param need to display
             * @param {Array} theValues the values that need to display
             */
            error: function () {
                var args = Array.prototype.slice.call(arguments, 0);
                angular.bind(this, _log, 'error', args)();
            },

            /**
             * log the messages into Error logging
             *
             * @param {String} functionName name of the function need to log
             * @param {String} displayParam the param need to display
             * @param {Array} theValues the values that need to display
             */
            debug: function () {
                var args = Array.prototype.slice.call(arguments, 0);
                angular.bind(this, _log, 'debug', args)();
            }
        };
    }]);
