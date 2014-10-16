'use strict';

angular.module('itaxiApp')
    .controller('DriverInfoCtrl', ['$scope', '$logger', 'gmaps', 'taxi', '$fetchData', '$auth', '$ionicScrollDelegate', '$rootScope', '$stateParams', '$restful', 'appDataStore', 'appConfig', '$socketIo', '$ionicSlideBoxDelegate', '$baseModel', '$ionicLoading',
        function ($scope, $logger, gmaps, taxi, $fetchData, $auth, $ionicScrollDelegate, $rootScope, $stateParams, $restful, appDataStore, appConfig, $socketIo, $ionicSlideBoxDelegate, $baseModel, $ionicLoading) {
            $logger.info('DriverInfo Controller', 'start', true);


            $scope.currentSlide = 0;
            $scope.messageContent = '';
            $scope.canAddTaxi = false;
            $scope.removeMyTaxiProcess = false;
            var driverID = $stateParams.id;

            var loadDriverInfo = function () {

                $rootScope.showStatus('Đang lấy thông tin..');

                if (appDataStore.taxiInfo.size() > 0 && appDataStore.taxiInfo.get(driverID)) {
                    $scope.infomation = appDataStore.taxiInfo.get(driverID);

                } else {
                    $restful.get({table: 'Drivers', id: driverID}, function (resp) {
                        if (resp.success) {
                            var data = new $baseModel('Drivers', resp.data);
                            appDataStore.taxiInfo.add(data);

                            $scope.infomation = resp.data;

                            var filter = [
                                {
                                    property: 'customer',
                                    value: $auth.getAppRegisterInfo().id,
                                    type: 'string',
                                    comparison: 'eq'
                                },
                                {
                                    property: 'driver',
                                    value: driverID,
                                    type: 'string',
                                    comparison: 'eq'
                                }
                            ];

                            $restful.get({table: 'MyTaxi', filter: JSON.stringify(filter)}, function (resp) {
                                if (resp.success) {
                                    if (resp.data.length > 0) {
                                        console.log('Data MyTaxi : ', resp.data);
                                        $scope.canAddTaxi = false;
                                    } else {
                                        console.log('Data MyTaxi : null');
                                        $scope.canAddTaxi = true;
                                    }
                                    $logger.info('getMyTaxi', 'length', resp.data.length);

                                } else {
                                    $scope.canAddTaxi = false;
                                    //$ionicLoading.setContent('Lấy thông tin thất bại..');

                                }
                            });


                            //$ionicLoading.hide();
                        } else {
                          $rootScope.showStatus('Lấy thông tin thất bại',1400);
                        }
                    });
                }
            };

            $scope.removeMyTaxi = function () {
                $scope.removeMyTaxiProcess = true;

                var _id = $scope.infomation[0].id;

                var filter = [
                    {
                        property: 'customer',
                        value: $auth.getUserId(),
                        type: 'string',
                        comparison: 'eq'
                    },
                    {
                        property: 'driver',
                        value: _id, // status route has been destroy
                        type: 'string',
                        comparison: 'eq' // Not Equal
                    }
                ];
                $restful.get({table: 'MyTaxi', filter: JSON.stringify(filter)}, function (resp) {

                    if (resp.success) {

                        $restful.delete({table: 'MyTaxi', id: resp.data[0].id}, function (resp) {
                            if (resp.success) {
                                $scope.removeMyTaxiProcess = false;
                                $rootScope.notify('Xóa Taxi thành công');
                                $scope.canAddTaxi = true;
                            } else {
                                $rootScope.notify('Có lỗi xẩy ra !');
                            }
                        });
                    }else {
                        $scope.removeMyTaxiProcess = false;
                        $rootScope.notify('Có sự cố xảy ra ! Vui lòng thử lại sau .');
                    }
                });


            };
            $scope.sendMessage = function (messageContent) {

                var emitData = {
                    from: appConfig.deviceId,
                    to: taxi.getDirectionInfo()[0].driver.username,
                    name: 'Khách hàng',
                    deviceId: appConfig.deviceId,
                    content: messageContent,
                    time: new Date(),
                    status: 0
                };

                $logger.info('$socketIo', 'send:message', emitData);
                $rootScope.messageData.push(emitData);
                $socketIo.emit('send:message', emitData);

                $ionicScrollDelegate.scrollBottom(true);

                document.getElementById('chatContent').value = '';


            };


            $scope.nextSlide = function () {
                $ionicSlideBoxDelegate.next();
                $scope.currentSlide = $ionicSlideBoxDelegate.currentIndex();
            };

            $scope.previousSlide = function () {
                $ionicSlideBoxDelegate.previous();
                $scope.currentSlide = $ionicSlideBoxDelegate.currentIndex();
            };


            $scope.addMyTaxi = function (taxiInfo) {
                $rootScope.notify('Đang thêm ..', true);

                var data = {
                    customer: $auth.getAppRegisterInfo().id,
                    driver: driverID
                };
                $restful.save({table: 'MyTaxi'}, data, function (resp) {

                    $rootScope.hideNotify();
                    if (resp.success) {
                        $scope.canAddTaxi = false;
                        $logger.info('addMyTaxi', 'success', true);
                    } else {
                        $logger.info('addMyTaxi', 'success', false);
                    }
                })
            };

            /*  if (appDataStore.collection.listTaxiAccept.get(driverID)) {
             $scope.infomation = appDataStore.collection.listTaxiAccept.get(driverID);
             }*/


            $scope.callTaxiPhone = function (info) {
                window.location = "tel:" + info.phone;
            };

            $rootScope.$on('receipt:message', function () {
                $ionicScrollDelegate.scrollBottom(true);
            });

            loadDriverInfo();

        }]);