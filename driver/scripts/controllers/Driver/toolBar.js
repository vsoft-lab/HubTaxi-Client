'use strict';

angular.module('taxigoDriverApp')
    .controller('toolBarCtrl', ['$scope', '$rootScope' , 'gmaps', '$timeout', 'auth', '$state', 'logger', function ($scope, $rootScope, gmaps, $timeout, auth, $state, logger) {

        // Thoát khỏi ứng dụng

        $scope.logout = function () {
            var confirm = window.confirm("Bạn muốn đang xuất 111?");
            if (confirm == true) {
                auth.logout(function (success) {
                    if (success) {
                        $rootScope.isLogin = false;

                        if(window.socketIo){
                            window.socketIo.disconnect();
                        }

                        $state.go('login');

                    } else {
                    }
                });
            }

        };

        /*Trỏ về vị trí hiện tại trên bản đồ*/


        $scope.goToCenter = function () {
            console.log('OK to center : ');
            gmaps.direcCenter();
        }
    }]);