'use strict';

angular.module('taxigoDriverApp')
    .factory('appDataStore', [
        '$q',
        'logger',
        'auth',
        'fetchData',
        '$collection',
        function ($q, logger, auth, fetchData, $collection) {

            /**
             * setting for logger Factory
             *
             * @param {string} moduleName Module Name
             * @param {boolean} disableLog.info Enable or Disable info log
             * @param {boolean} disableLog.error Enable or Disable error log
             */

            logger.moduleName = 'appDataStore Factory';
            logger.info('appDataStore', 'start', true);

            var appDataStore = {};
            appDataStore.home = {
                postBlock : null,
                stackoverflowBlock : null
            };

            appDataStore.tag = {
                postBlock : {}
            };
            appDataStore.stackoverFlow ={
                tag: null,
                stackBlock : {}
            };

            appDataStore.app = {
                post: $collection.getInstance(),
                stackoverFlow: $collection.getInstance()
            };

            appDataStore.TagCollection = $collection.getInstance();
            appDataStore.postCollection = null;

            appDataStore.userCollection = null;
            appDataStore.commentCollection = null;
            appDataStore.tranningCollection = null;
            appDataStore.annoucementCollection = null;
            appDataStore.stackoverflowCollection = null;


            return appDataStore;

        }]);
