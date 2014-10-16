angular.module('itaxiManagerApp')
    .controller('detailCustomerCtrl', ['$scope', '$logger', '$timeout', '$fetchData', 'appDataStore' , '$baseModel', '$restful', '$http', '$state', '$stateParams', function ($scope, $logger, $timeout, $fetchData, appDataStore, $baseModel, $restful, $http, $state, $stateParams) {

        $scope.activeForm = 0;

        $scope.back = function () {
            $scope.activeForm = 0;
        }

        var userId = $stateParams.id;
        console.log('User ID :', userId);

        var loadUserHistory = function (userId) {

            var filters = [
                {
                    property: 'customer',
                    value: userId,
                    type: 'string',
                    comparison: 'eq'
                }
            ];

            var sorters = [
                {
                    property: 'startAt',
                    direction: 'DESC'
                }
            ];

            $fetchData.getData('RouteHistories', null, null, filters, sorters).then(function (resp) {
                $scope.listUsersHistory = resp.all();
                $scope.username = $scope.listUsersHistory[0].customer.deviceId;
                console.log('listUsersHistory', $scope.listUsersHistory,$scope.username);
            }, function (err) {
                console.log('err : ', err);
            })
        };
        loadUserHistory(userId);

    }]);
