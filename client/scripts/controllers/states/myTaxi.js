
'use strict';

angular.module('itaxiApp')
    .controller('myTaxiCtrl', ['$scope', '$logger', 'gmaps', 'taxi', '$fetchData', '$auth', '$ionicLoading', 'appDataStore','$restful',

        function ($scope, $logger, gmaps, taxi, $fetchData, $auth, $ionicLoading, appDataStore, $restful) {

            $scope.listMyTaxi = [];
            $scope.checkMyTaxi = true;

            // loadMyTaxi from Schema myTaxi

            var loadMyTaxi = function () {

                $ionicLoading.show({
                    content: 'Đang tải ...',
                    animation: 'fade-in',
                    showBackdrop: false,
                    maxWidth: 200
                });

                // filters cording attribute

                var filter = [
                    {
                        property: 'customer',
                        value: $auth.getAppRegisterInfo().id,
                        type: 'string',
                        comparison: 'eq'
                    }
                ];
                // $restful API document
                $restful.get({table: 'MyTaxi', filter: JSON.stringify(filter)}, function (resp) {
                    $ionicLoading.hide();

                    if(resp.success){
                        if(resp.data.length > 0){
                            console.log('myTaxi : ',resp.data);
                            $scope.listMyTaxi = resp.data;
                            $logger.info('loadMessage', 'success', resp);
                        }else{
                            $scope.checkMyTaxi = false;
                        }
                    }


                });

            };

            loadMyTaxi();

        }]);