'use strict';

angular.module('itaxiApp')
    .controller('BootstrapCtrl', ['$scope', '$rootScope', '$ionicSideMenuDelegate', '$timeout', '$restful', 'appDataStore', '$logger', 'taxi', 'gmaps', 'appConfig', '$ionicLoading', '$state', '$socketIo', '$ionicPopup', '$auth', 'routes',
        function ($scope, $rootScope, $ionicSideMenuDelegate, $timeout, $restful, appDataStore, $logger, taxi, gmaps, appConfig, $ionicLoading, $state, $socketIo, $ionicPopup, $auth, routes) {

            $logger.moduleName = 'Bootstrap Controller';

            $scope.showHelp = $auth.isFirstLogon();
            $scope.quickChooseTaxiProcess = false;
            /* Drag menu */


            // Close menu Left (button)
            $scope.toggleLeft = function () {
                $ionicSideMenuDelegate.toggleLeft();
            };
            //Close menu right (button)
            $scope.toggleRight = function () {
                $ionicSideMenuDelegate.toggleRight();
            };



            // Close overlay Help,after go to home

            $scope.collapesHelp = function () {
                $auth.setFirstLogon();
                $state.go('app.home');
                $scope.showHelp = !$scope.showHelp;

            };
            /*

             * CM : Listen taxi send message
             * */

            //Refresh list Taxi on map

            $scope.refreshTaxi = function () {
                gmaps.findTaxi(4);
            };

          

            // Gọi Taxi nhanh (Thao Thao tác này thực hiện khi mở menu phải)

            $rootScope.quickChooseTaxi = function (taxiInfo) {
                $scope.quickChooseTaxiProcess = true;

                $rootScope.showStatus("Đang kết nối với taxi...", true);  // Show StatusBar
                if ($ionicSideMenuDelegate.isOpen()) {
                    $logger.info('$ionicSideMenuDelegate', 'isOpen', true);
                    $scope.toggleRight(); // Return main
                }


                /*
                 var listClass = event.srcElement.className.split(' '),
                 carLicClass = _.last(listClass).split('-'),
                 currentCar = _.last(carLicClass, 2).join('-');
                 */

                // get Username or Carlic
                var carLic = (taxiInfo.username) ? taxiInfo.username : taxiInfo.carLic;


                var emitData = {
                    roomID: taxi.getCurrentRoomID(),
                    carLic: carLic,
                    customerDeviceId: appConfig.deviceId,
                    startPoint: $rootScope.startPoint
                };

                if ($rootScope.endPoint == '') {
                    emitData.endPoint = emitData.startPoint;
                } else {
                    emitData.endPoint = $rootScope.endPoint;
                }

                // Create Socket with data emitData
                socketIo.emit('quick:customer:choose:taxi', emitData);

                console.log('quick:customer:choose:taxi', emitData);
                $rootScope.notify('Gửi yêu cầu thành công !\nVui lòng đợi taxi xác nhận');
                $rootScope.watingTaxi = true;
                $scope.quickChooseTaxiProcess = false;
            };


            window.socketIo.on('send:quick:taxi:accept:request', function (data) {


                $rootScope.showStatus("Đang đợi taxi đón ...", true);
                $rootScope.notify('Taxi đã đông ý yêu cầu của bạn.');
                $rootScope.watingTaxi = false;

                var routeData = {
                    id: data.taxiId,
                    username: data.carLic
                };
                $logger.info('send:quick:taxi:accept:request', 'start', true);

                routes.chooseTaxi(routeData, true, function (err, result) {
                    if (err) {
                        // TODO : Do something
                    } else {
                        $logger.info('chooseTaxi', 'success', true);
                        $rootScope.status.hasRouter = true;
                    }
                })
            });

            // List Taxi choose me
            socketIo.on('taxi:choose:me', function (data) {
                $rootScope.status.callTaxiProcess = false;
                console.log('taxi:choose:me', data);

                $rootScope.status.hasDriveAccept = true;
                $scope.$apply(function () {
                    $rootScope.status.callCounter = -2;
                    $rootScope.status.showCounter = false;
                    /*
                     $scope.notDriver = false;
                     $scope.showListCall = true;
                     */
                });

                // get information Taxi choose me!
                $restful.get({table: 'Drivers', id: data.taxiId}, function (resp) {

                    appDataStore.collection.listTaxiAccept.add(resp.data[0]);

                }, function (err) {
                    console.log('error', err);
                });
            });

            // listening start router
            socketIo.on('start:route', function (data) {

                if (navigator.notification) {
                    navigator.notification.beep(1);
                }
                $rootScope.status.hasDriveAccept = false;
                $logger.info('start:route', 'start', true);

                /*$scope.$apply(function () {
                 $scope.ButtonDestroyCall = false;
                 $scope.showListCall = false;
                 });

                 console.log('Status $scope.ButtonDestroyCall ', $scope.ButtonDestroyCall);*/
                $rootScope.$apply(function () {
                    $rootScope.watingTaxi = false;
                });


                if ($rootScope.routeCaculator) {
                    $rootScope.showStatus($rootScope.routeCaculator);


                }

                $rootScope.pageTitleCalu = 'iTaxi';
                $rootScope.notify('Lộ trình đã được bắt đầu !');

            });


            window.socketIo.on('taxi:leave:room', function (data) {
                angular.forEach(appDataStore.collection.listTaxiAccept.all(), function (v, k) {
                    if (v.username == data.carLic) {

                        console.log(data.carLic, ' leave out room');


                        appDataStore.collection.listTaxiAccept.remove(appDataStore.collection.listTaxiAccept.get(v.id));
                        $rootScope.$broadcast('taxi:leave:room', {hello: v.id});
                    }
                })
            });


            /*if(window.connect.WIFI || window.connect['3G']){*/

            socketIo.on('send:taxi', function (data) {

                taxi.listCurrentTaxi = {};
                $rootScope.listTaxiMenuRight = [];

                for (var property in data) {
                    if (data.hasOwnProperty(property) && angular.isObject(data[property]) && data[property].taxiId !== '') {
                        $rootScope.listTaxiMenuRight.push(data[property]);
                    }
                }


                taxi.listCurrentTaxi = data;
                taxi.setCurrentRoomID(data.roomID);


                gmaps.createMarker(data);
            });
            /*}*/

            /*  $scope.showConfirmCall = function (data) {
             $ionicPopup.confirm({
             title: 'Lái xe: ' + data.carLic,
             content: 'Hãng : ' + data.taxi + '\nSố chỗ :' + data.seatNum + '\nCách bạn: ' + data.distance + ' Km'
             }).then(function (res) {
             if (res) {
             $scope.quickChooseTaxi(data);
             } else {
             }
             });
             };*/


            window.socketIo.on('send:taxi:logout', function (data) {
                console.log('taxi in room has logout', data);
            });


            socketIo.on('route:has:destroy', function (data) {
                // TODO : when route has destroy.It will update status and clear route info in local storage.
                $rootScope.pageTitleCalu = '';
                var msg = '';
                $rootScope.pageTitle = 'iTaxi - Home';
                $rootScope.watingTaxi = false;
                $rootScope.status.hasDriveAccept = false;
                switch (data.status) {
                    case 2:
                        msg = 'Lộ trình đã kết thúc!';
                        break;
                    case 3:
                        msg = 'Quý khách đã hủy lộ trình thành công';
                        break;
                    case 4:
                        msg = 'Lộ trình đã bị taxi hủy !. <br/>Tổng đài hỗ trợ: 19006789';
                        break
                }

                var destroyRouteFlag = false;
                $rootScope.notify(msg);

                taxi.setCurrentRoomID(null);
                taxi.setCurrentStatus(0);
                taxi.setDirectionInfo(null);

                $rootScope.messageData = [];


                //navigator.geolocation.getCurrentPosition(gmaps.getPositionSuccess, gmaps.getPositionError);

                $scope.refreshTaxi(4);

                if (gmaps.endPointMarker && gmaps.startPointMarker) {
                    gmaps.map.removeLayer(gmaps.endPointMarker);
                    gmaps.map.removeLayer(gmaps.startPointMarker);
                }
                if (gmaps.RoutePolyline) {
                    gmaps.map.removeLayer(gmaps.RoutePolyline);
                }

                if (gmaps.markerCluster) {
                    gmaps.markerCluster.clearMarkers();
                }

                gmaps.map.setZoom(15);

                gmaps.map.panTo(gmaps.currentPoint.getLatLng());

                $rootScope.$apply(function () {
                    $rootScope.status.hasRouter = false;
                });

                $rootScope.hideStatus();
                $logger.info('route:has:destroy', 'success', true);

            });


            $scope.doRefresh = function () {

                $scope.refreshTaxi();

                $timeout(function () {
                    $scope.$broadcast('scroll.refreshComplete');

                }, 1000);

            };


            $socketIo.on('receipt:message', function (messageData) {
                /*if (navigator.notification) {
                 navigator.notification.beep(1);
                 }
                 console.log('beep');*/

                console.log('receipt:message', 'data', messageData);
                $rootScope.messageData.push(messageData);
                $rootScope.status.readMess = true;
                $rootScope.$broadcast('receipt:message')
            });


        }]);
