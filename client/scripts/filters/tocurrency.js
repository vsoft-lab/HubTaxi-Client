'use strict';

angular.module('itaxiApp')
    .filter('toCurrency', [function () {
        return function (number) {
            var numberStr = number.toString(),
                dollars = numberStr.split('.')[0],
                cents = (numberStr.split('.')[1] || '') + '';
            dollars = dollars.split('').reverse().join('')
                .replace(/(\d{3}(?!$))/g, '$1,')
                .split('').reverse().join('');
            return '' + dollars;
        };
    }]);
