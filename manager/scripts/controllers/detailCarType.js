angular.module('itaxiManagerApp')
    .controller('detailtHrCtrl', ['$scope', '$logger', '$timeout', '$fetchData', 'appDataStore' , '$baseModel', '$restful', '$http', '$state', '$stateParams', function ($scope, $logger, $timeout, $fetchData, appDataStore, $baseModel, $restful, $http, $state, $stateParams) {
        $scope.activeForm = 0;

        var _id = $stateParams.id;

        $scope.back = function () {
            $scope.activeForm = 0;
        };

        var loadDrivingDetail = function (userId) {
            if (appDataStore.DriverTypes.size() > 0) {
                $scope.data = appDataStore.DriverTypes.get(userId);
                console.log('Load detail Type Car :',userId);
            } else {
                $restful.get({table: 'driverTypes', id: _id}, function (resp) {
                    console.log('Data type : ', resp);
                    if (resp.success) {
                        $scope.data = resp.data;
                        console.log('Data :', resp.data);

                    } else {
                        console.log(resp);
                    }
                })
            }
        };


        loadDrivingDetail(_id);


        $scope.update = function (item) {
            console.log('item save : ', item);
            var itemSave = new $baseModel('driverTypes', item);
            itemSave.save(function (err, result) {
                if (!err) {
                    toastr.info('Cập nhật thông tin xe thành công!');
                    appDataStore.DriverTypes.update(item);
                } else {
                    toastr.error('Lỗi cập nhật thông tin xe');
                }
            })
        }


    }]);
