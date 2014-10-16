'use strict';

angular.module('itaxiManagerApp')
    .factory('appDataStore', [
        '$logger',
        '$collection',
        function ($logger, $collection) {

            /**
             * setting for $logger Factory
             *
             * @param {string} moduleName Module Name
             * @param {boolean} disableLog.info Enable or Disable info log
             * @param {boolean} disableLog.error Enable or Disable error log
             */

            $logger.moduleName = 'appDataStore Factory';
            $logger.info('appDataStore', 'start', true);

            var appDataStore = {};
            appDataStore.Drivings = $collection.getInstance();
            appDataStore.DriverTypes = $collection.getInstance();
            appDataStore.listUsers = $collection.getInstance();
            appDataStore.routeHis = $collection.getInstance();

            return appDataStore;

        }]);
