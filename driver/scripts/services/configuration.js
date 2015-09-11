'use strict';

angular.module('taxigoDriverApp')
    .factory('config', ['$rootScope', '$timeout', function ($rootScope, $timeout) {

        var config = {
            deviceId: (window.device) ? device.uuid : '9f9f9f99999',
            name: 'Taxi Go',
            apiHost: 'http://192.168.1.107:6868', //http://192.168.5.105:9696
            mediaHost: 'http://nodejs.vn:6969',
            isLogin: false
        };
        return config;
    }]);