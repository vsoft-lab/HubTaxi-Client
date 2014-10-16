// Resizing a div with AngularJS
'use strict';

angular.module('taxigoDriverApp')
    .directive('resizeWidth', function ($window) {
        return function (scope, element) {

            scope.getWinWidth = function () {
                return $window.innerWidth;
            };

            var setNavHeight = function (newPosition) {
                element.css('marginLeft', newPosition + 'px');
            };

            // Set on load
            var test = function (newValue, oldValue) {
                var newPosition = (scope.getWinWidth() / 2) - (element[0].clientWidth / 2);
                setNavHeight(newPosition);
            };

            test();
        };
    });