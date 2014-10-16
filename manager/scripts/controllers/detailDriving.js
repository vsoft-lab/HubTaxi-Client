'use strict';

angular.module('itaxiManagerApp')
    .controller('detailtDrivingCtrl', ['$scope', '$logger', '$timeout', '$fetchData', 'appDataStore' , '$baseModel', '$restful', '$http', '$state', '$stateParams', '$upload',
        function ($scope, $logger, $timeout, $fetchData, appDataStore, $baseModel, $restful, $http, $state, $stateParams, $upload) {
        $scope.userNotRouter = false;
        var files = null;
            $scope.selectFile = function ($files, driving) {

                files = $files;
                $logger.info(files);
                $scope.classShowUpload = 'showon';
            };

            $scope.uploads = function () {
                $logger.info('uploads ', files);

                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    $scope.upload = $upload.upload({
                        url: 'http://vsoft.vn:1235/upload', // upload.php script, node.js route, or servlet url
                        method: 'POST', // or 'PUT',


                        file: file // or list of files: $files for html5 only

                    }).progress(function (evt) {
                        $logger.info(evt);
                    }).success(function (data, status, headers, config) {

                         $logger.info(data);
                    });
                }
            };





        $scope.changeAvatar = function () {
            $('#changeAva').click();
        };

        var readURL = function (input) {

            if (input.files && input.files[0]) {
                var reader = new FileReader();

                reader.onload = function (e) {
                    $('#chAvatar').attr('src', e.target.result);
                };

                reader.readAsDataURL(input.files[0]);
            }
        };

        $("#changeAva").change(function () {
            readURL(this);
        });

        var userId = $stateParams.id;

        // $scope.driver = appDataStore.Drivings.get(userId);

        var loadTypeDriver = function () {

            if (appDataStore.DriverTypes.size() > 0) {
                $scope.DriverTypes = appDataStore.DriverTypes.all();
            } else {
                $fetchData.getData('driverTypes', null, null, null, null).then(function (resp) {
                    $scope.DriverTypes = resp.all();
                    appDataStore.DriverTypes.addAll(resp.all());
                }, function (err) {
                    $logger.info('err : ', err);
                })
            }
        };

        var loadHistory = function (userId) {

            var filters = [
                {
                    property: 'driver',
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
                $scope.RouteHistories = resp.all();
                $logger.info('RouteHistories', $scope.RouteHistories);
                if ($scope.RouteHistories.length == 0) {
                    $scope.userNotRouter = true;
                }
            }, function (err) {
                $logger.info('err : ', err);
            })
        };


        var loadDrivingDetail = function (userId) {
                if (appDataStore.Drivings.size() > 0) {
                    $scope.driver = appDataStore.Drivings.get(userId);

                } else {
                    $restful.get({table: 'drivers', id: userId}, function (resp) {
                        if (resp.success) {
                            $scope.driver = new $baseModel('Drivers', resp.data[0]);

                        } else {
                            $logger.info(resp);
                        }
                    })
                }
            }
            ;

        $scope.enabale = true;

        $scope.change = function () {
            $scope.enabale = !$scope.enabale;
        };

        $scope.enabalePhone = true;

        $scope.changePhone = function () {
            $scope.enabalePhone = !$scope.enabalePhone;
        };

        $scope.activeFormFun = function () {
            $scope.activeForm = !$scope.activeForm;
        };

        $scope.find = function(data){
            $scope.driver.type.seatNum = appDataStore.DriverTypes.get(data).seatNum;
        };

        $scope.update = function (item) {
            var typeDriver = item.type._id;
            item.type = typeDriver;
            $logger.info('item save : ', item.type);

            var itemSave = new $baseModel('Drivers', item);

            itemSave.save(function (err, result) {
                if (!err) {
                    toastr.info('Cập nhật thông tin lái xe thành công!');
                    appDataStore.Drivings.update(result[0]);
                    $scope.enabale = true;
                    $scope.driver = result[0];
                } else {
                    toastr.error('Lỗi cập nhật thông tin lái xe');
                }
            })
        };


        loadDrivingDetail(userId);
        loadTypeDriver();
        loadHistory(userId);
    }]);
