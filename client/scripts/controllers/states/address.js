'use strict';



// NOT USE





angular.module('itaxiApp')
    .controller('addressCtrl', ['$scope', '$logger', 'gmaps', 'taxi', '$fetchData', '$auth', '$http', '$rootScope', '$state',
        function ($scope, $logger, gmaps, taxi, $fetchData, $auth, $http, $rootScope, $state) {
            var startPoint = new google.maps.places.Autocomplete((document.getElementById('startPoint')), { types: ['geocode'] });
            var endPoint = new google.maps.places.Autocomplete((document.getElementById('endPoint')), { types: ['geocode'] });

            var directionsService = new google.maps.DirectionsService();
            var directionsDisplay = new google.maps.DirectionsRenderer();

            $scope.router = function (index) {


                directionsDisplay.setDirections({ routes: [] });

                if (index != null) {

                    var start = index.start;
                    var end = index.end;
                    directionsDisplay.setPanel(document.getElementById('panel'));

                    var request = {
                        origin: document.getElementById('startPoint').value,
                        destination: document.getElementById('endPoint').value,
                        travelMode: google.maps.DirectionsTravelMode.DRIVING
                    };


                    directionsService.route(request, function (response, status) {
                        if (status == google.maps.DirectionsStatus.OK) {
                            directionsDisplay.setDirections(response);
                        }
                    });

                } else {
                    $rootScope.notify('Vui lòng nhập đầy đủ!', 1000);
                }
            };


            $scope.callTaxi = function (index) {
                $state.go('app.home');
            };


            /*
             * Get Geoloction
             *  */


        }]);