'use strict';

angular.module('taxigoDriverApp')
    .controller('HistoryCtrl', ['$rootScope', '$scope', 'gmaps', '$timeout', 'auth', '$state', 'config', 'driver', '$location', 'fetchData',
        function ($rootScope, $scope, gmaps, $timeout, auth, $state, config, driver, $location, fetchData) {

            var loadHistory;

            loadHistory = function () {
                var userId = auth.getUserId();

                // Tìm kiếm
                var filter = [
                    {
                        property: 'driver',
                        value: userId,
                        type: 'string',
                        comparison: 'eq'
                    }

                ];

                // sắp xếp hiển thị
                var sorter = [
                    {
                        property: 'endAt',
                        direction: 'DESC'
                    }
                ];


                // GET DATA lịch sử lộ trình
                fetchData.getData('RouteHistories', 0, 1000, filter, sorter).then(function (result) {
                    $scope.listHistoryDriver = result.all();
                    console.log('Data : ', $scope.listHistoryDriver);
                })
            };
            loadHistory();
        }]);
