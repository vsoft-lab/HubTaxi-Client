'use strict';

angular.module('itaxiManagerApp')
    .controller('googleMapCtrl', ['$scope', '$logger', '$http', 'appConfig', '$restful' , '$socketIo',
        function ($scope, $logger, $http, appConfig, $restful, $socketIo) {
            $logger.moduleName = 'GoogleMap Ctrl';
            $logger.info('googleMapCtrl', 'start', true);


            var listPositionTaxi = [];
            var map;
            var heatMap = null;
            var createMarker = null;
            var listMarker = {},
                loadTaxiInfo;
            $scope.taxiInfo = {};
            $scope.Object = Object;

            /*
             * List Taxi Status :
             * 0 : Normal - Đang đợi khách
             * 1 : Busy (hanshaking with taxi or runing) : Đang đón hoặc đang chạy
             * 2 : Die (disconect or ....) : Disconnect or visible
             * */

            $scope.listTaxi = {};
            $scope.listTaxiRuning = {};
            $scope.listTaxiWaiting = {};


            createMarker = function (marker) {
                var icon = '';

                if (marker.status == 1) {
                    icon = 'images/icon2.png';
                } else {
                    icon = 'images/icon1.png';
                }

                var mk = new google.maps.Marker({
                    position: new google.maps.LatLng(marker.lat, marker.lng),
                    title: "Hello World!",
                    carLic: marker.carLic,
                    icon: icon
                });

                listMarker[marker.carLic] = mk;
                listMarker[marker.carLic].setMap(map);

                google.maps.event.addListener(mk, 'click', function () {
                    $('#myModal').modal('show');
                    loadTaxiInfo('tungnguyen');
                });
            };

            var clearMarker = function (carLic) {
                if (carLic) {
                    if (listMarker.hasOwnProperty(carLic)) {
                        listMarker[carLic].setMap(null);
                        delete listMarker[carLic];
                    }
                } else {
                    for (var pro in listMarker) {
                        if (listMarker.hasOwnProperty(pro)) {
                            listMarker[pro].setMap(null);
                            delete listMarker[pro];
                        }
                    }
                }
            };

            loadTaxiInfo = function (carLic) {
                var filters = [
                    {

                        property: 'username',
                        type: 'string',
                        value: carLic,
                        comparison: 'eq'
                    }
                ];
                $restful.get({table: 'Drivers', filter: JSON.stringify(filters)}, function (resp) {
                    if (resp.success) {
                        if (resp.data.length > 0) {
                            $scope.taxiInfo = resp.data[0];
                            console.log($scope.taxiInfo);
                        }

                    }
                })
            };

            var loadTaxi = function () {
                $http.get(appConfig.apiHost + '/getTaxi').success(function (resp) {
                    if (resp.success) {
                        async.forEach(Object.keys(resp.data), function (key, next) {
                            listPositionTaxi.push(new google.maps.LatLng(resp.data[key].lat, resp.data[key].lng));
                            $scope.listTaxi[key] = resp.data[key];
                            createMarker(resp.data[key]);
                            if (resp.data[key].status == 0) {
                                $scope.listTaxiWaiting[key] = resp.data[key];
                            } else {
                                $scope.listTaxiRuning[key] = resp.data[key];
                            }
                            next();
                        }, function (err) {
                            var pointArray = new google.maps.MVCArray(listPositionTaxi);

                            heatMap = new google.maps.visualization.HeatmapLayer({
                                data: pointArray
                            });
                            heatMap.setMap(map);
                        });

                    }
                });
            };



            function initialize() {
                var mapOptions = {
                    zoom: 13,
                    center: new google.maps.LatLng(21.004027, 105.823209)
                };

                map = new google.maps.Map(document.getElementById('map-canvas'),
                    mapOptions);
            }



            $socketIo.on('taxi:send:location:manager', function (data) {

                $scope.listTaxi[data.carLic] = data;

                if (data.status == 0) {
                    $scope.listTaxiWaiting[data.carLic] = data;
                } else {
                    $scope.listTaxiRuning[data.carLic] = data;
                }
                if (data.isNew) {

                    createMarker(data);

                } else if (listMarker.hasOwnProperty(data.carLic)) {

                    listMarker[data.carLic].setPosition(new google.maps.LatLng(data.lat, data.lng));
                }
            });


            /*
            * Work with socket.io
            * */

             $socketIo.on('taxi:disconnect', function (data) {
                if (listMarker.hasOwnProperty(data.carLic)) {
                    clearMarker(data.carLic);
                }

                if($scope.listTaxiWaiting.hasOwnProperty(data.carLic)){
                    delete $scope.listTaxiWaiting[data.carLic];
                }
                if($scope.listTaxi.hasOwnProperty(data.carLic)){
                    delete $scope.listTaxi[data.carLic];
                }
                if($scope.listTaxiRuning.hasOwnProperty(data.carLic)){
                    delete $scope.listTaxiRuning[data.carLic];
                }
            });

            initialize();
            loadTaxi();
        }]);

