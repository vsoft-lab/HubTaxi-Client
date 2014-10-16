'use strict';

angular.module('itaxiApp')
    .controller('RegisterCtrl', ['$rootScope', '$scope', '$logger', 'gmaps', 'taxi', '$fetchData', '$auth', '$state', '$timeout', '$ionicLoading',
        function ($rootScope, $scope, $logger, gmaps, taxi, $fetchData, $auth, $state, $timeout, $ionicLoading) {
            $logger.info('Register Controller', 'start', true);

            $scope.registerProcess  = false;

            // update user information

            $scope.updateUserInfo = function (info) {
                $scope.registerProcess = true;
                if (!$auth.getRegisted) {
                    //TODO : action
                    $scope.registerProcess  = false;

                } else if (!info || !info.password || !info.repassword || !info.username || !info.fullname) {
                    $rootScope.notify('Vui lòng nhập đầy đủ thông tin', 1500);

                    $scope.registerProcess  = false;
                } else if (info.password != info.repassword) {
                    $rootScope.notify('2 mật khẩu không khớp! vui lòng nhập chính xác', 1500);

                    $scope.registerProcess  = false;
                } else {
                    var _loading = $ionicLoading.show({
                        content: 'Đang đăng ký ...',
                        showBackdrop: false
                    });
                    var uId = $auth.getAppRegisterInfo().id;

                    // auto register user device if device not register
                    $auth.updateUserInfo(info, function (err, result) {
                        if (err) {
                            $logger.info('updateUserInfo', 'err', err);
                        } else {
                            if (result.success) {
                                $logger.info('Register info', 'success', info);

                                $auth.setRegisted();
                                $auth.setAppRegister(result.data);

//                                $scope.waitLogin = true;
                                _loading.setContent('Đang đăng nhập vào hệ thống ...');

                                $auth.login(info.username, info.password, function (err, result) {

                                    if (err) {
                                        _loading.setContent('Đăng nhập thất bại ...');

                                        $timeout(function () {
                                            _loading.hide();
                                        }, 500);

                                        //$scope.loginMessage = 'Đăng nhập thất bại !. </br> Vui lòng thử lại';
                                    } else {
                                        _loading.setContent('Đăng nhập thành công ..');

                                        $timeout(function () {
                                            _loading.hide();
                                        }, 500);

                                        $rootScope.isLogin = true;
                                        $scope.waitLogin = false;
                                        $scope.loginMessage = '';
                                        $scope.registerProcess  = false;

                                        $state.go('app.home');
                                    }
                                });
                            } else {
                                $scope.registerProcess  = false;
                                switch (result.message) {
                                    case 'REGISTER.ERR.REGISTED':
                                        $rootScope.notify('Thiết bị của bạn đã được đăng ký !\n');
                                        break;

                                    case 'REGISTER.ERR.USERNAME':
                                            $rootScope.notify('Số điện thoại này đã được sử dụng ! ');
                                        break;
                                }

                            }
                            $logger.info('updateUserInfo', 'resp', result);
                        }
                    });
                }
            };
        }]);