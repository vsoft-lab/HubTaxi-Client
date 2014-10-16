'use strict';

angular.module('taxigoDriverApp')
    .service('restful', ['$resource', '$cookieStore', '$rootScope', 'logger', 'config', function restful( $resource, $cookieStore, $rootScope, logger , config) {
        /**
         * setting for logger Factory
         *
         * @param {string} moduleName Module Name
         * @param {boolean} disableLog.info Enable or Disable info log
         * @param {boolean} disableLog.error Enable or Disable error log
         */
        logger.moduleName = 'Restful Service';

        return $resource(config.apiHost + '/:api/:table/:id', {
            api: 'api',
            id: '@id',
            table: '@table'
        }, {
            'get': {method: 'GET'},
            'save': {method: 'POST', params: {}},
            'put': {method: 'PUT', params: {}},
            'query': {method: 'GET', isArray: true},
            'delete': {method: 'DELETE', params: {}}
        });
    }]);
