/**
 * Created by chris on 6/30/14.
 */

'use strict';

angular.module('itaxiManagerApp')
    .controller('routeHistoryCtrl', ['$rootScope','$scope', '$logger', '$timeout', '$fetchData', 'appDataStore' , '$baseModel', '$restful', '$http', 'ngProgress',
        function ($rootScope,$scope, $logger, $timeout, $fetchData, appDataStore, $baseModel, $restful, $http, ngProgress) {
            // load all data from RouteHistory collection.
            var loadRoute = function() {
                if(appDataStore.routeHis.size() > 0) {
                    $scope.routeHis = appDataStore.routeHis.all();
                } else {
                    $fetchData.getData('RouteHistories', null, null, null, null).then(function (resp) {
                        $scope.routeHis = resp.all();
                        appDataStore.routeHis.addAll(resp.all());
                    }, function(err) {
                        console.log('Loi: ', err);
                    })
                }
            };


            loadRoute();
        }]);