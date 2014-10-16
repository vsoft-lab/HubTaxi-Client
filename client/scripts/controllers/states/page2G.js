'use strict';

angular.module('itaxiApp')
    .controller('page2GCtrl', ['$scope', '$logger', 'gmaps', 'taxi', '$fetchData', '$auth', 'appConfig', '$rootScope', '$socketIo',
        function ($scope, $logger, gmaps, taxi, $fetchData, $auth, appConfig, $rootScope, $socketIo) {
            $logger.info('2G Page Controller', 'start', true);

            $scope.listTaxiNearest = [];

            var onSuccess = function (position) {
                $logger.info('2G getPosition', 'success', position);

                var sendLocation = {
                    deviceId: appConfig.deviceId,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    LatLng: {'123': position.coords.latitude, '213': position.coords.longitude},
                    status: taxi.getCurrentStatus()
                };

                console.log(sendLocation);

                window.socketIo.emit('send:location', sendLocation); // Send current location to server
                $scope.refreshTaxi();
            };


            var onError = function (error) {

            };

            navigator.geolocation.getCurrentPosition(onSuccess, onError, {});


            window.socketIo.on('send:taxi', function (data) {
                console.log('send:taxi', data);
                taxi.listCurrentTaxi = {};
                $scope.listTaxiNearest = [];
                for (var property in data) {
                    if (data.hasOwnProperty(property) && angular.isObject(data[property]) && data[property].taxiId !== '') {
                        $scope.listTaxiNearest.push(data[property]);
                    }
                }


                taxi.listCurrentTaxi = data;
                taxi.setCurrentRoomID(data.roomID);

            });




        }]);