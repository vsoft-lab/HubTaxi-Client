'use strict';

angular.module('itaxiApp')
    .factory('appDataStore', [
        '$q',
        '$logger',
        '$auth',
        '$fetchData',
        '$collection',
        function ($q, $logger, $auth, $fetchData, $collection) {

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
            appDataStore.collection = {
                listTaxiAccept: $collection.getInstance()
            };

            appDataStore.messageData = $collection.getInstance();

            appDataStore.listBookmark = $collection.getInstance();
            appDataStore.taxiInfo = $collection.getInstance();


            appDataStore.setting = {

            };

            return appDataStore;

        }]);
