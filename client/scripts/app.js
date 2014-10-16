'use strict';


angular.module('itaxiApp', [
    'framework.vsoft',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ionic',
    'angularFileUpload',
    'angularMoment'
])
    .config(function ($urlRouterProvider, $stateProvider, $httpProvider) {


        $stateProvider
            .state('app', {
                abstract: true,
                url: '',
                templateUrl: 'views/app.html',
                controller: 'BootstrapCtrl',
                resolve: {
                    'user': ['$rootScope', '$auth', '$q', '$http', 'appConfig', '$logger', 'taxi', '$timeout', 'routes', '$state', function ($rootScope, $auth, $q, $http, appConfig, $logger, taxi, $timeout, routes, $state) {
                        $logger.moduleName = 'Resolve App Loading State';
                        $logger.info('Resolve App Loading State', 'start', true);

                        var defer = $q.defer();

                        $logger.info('Resolve App', 'isFirstLogon', $auth.isFirstLogon());


                        // NOT REMOVE (fixed device and redirect when app offline)

                        //document.addEventListener("deviceready", function () {

                        //  appConfig.deviceId = window.device.uuid;

                        /*
                         window.gpsDetect = cordova.require('cordova/plugin/gpsDetectionPlugin');

                         gpsDetect.checkGPS(onGPSSuccess, onGPSError);

                         function onGPSSuccess(on) {
                         if (on) console.log("GPS is enabled");
                         else alert("Thiết bị của bạn chưa bật GPS .");
                         }

                         function onGPSError(e) {
                         alert("Get Position Error : " + e);
                         }
                         */


                        //if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/BlackBerry/i)) {
                        //  if ($rootScope.checkConnection()) {

                        //} else {
                        //   return;
                        //}

                        //}


                        if (!$rootScope.appResolved) {

                            taxi.setCurrentStatus(0);
                            taxi.setDirectionInfo(null);

                            async.waterfall(
                                [function (cb) {
                                    $logger.info('getAppInfo', 'step', $rootScope.isLogin);
                                    if ($rootScope.isLogin && $auth.getAppRegisterInfo()) {
                                        $logger.info(' ----- checkIsLogin', true);
                                        cb(null, 1, $auth.getAppRegisterInfo());
                                    } else {

                                        $auth.getUserInfoByDeviceId(function (err, result) {
                                            if (err) {
                                                $logger.info('getUserInfoByDeviceId', 'err', err);
                                                cb(err, null);
                                            } else {
                                                if (result.length == 1) {

                                                    $logger.info('getUserInfoByDeviceId', 'deviceId', true);
                                                    $auth.setAppRegister(result[0]);
                                                    if (result[0].phone) {
                                                        $auth.setPhoneNumber(result[0].phone);
                                                    }

                                                    cb(null, 1, result[0]);

                                                } else {
                                                    $logger.info('getUserInfoByDeviceId', 'deviceId', false);

                                                    cb(null, 0, result[0]);

                                                }
                                            }
                                        });
                                    }
                                }, function (status, userInfo, cb) { // STEP 2 : Register Device if deviceId not isset in server

                                    $logger.info('getAppInfo', 'step', 2);
                                    if (status == 1) {

                                        cb(null, userInfo);
                                    } else {
                                        $logger.info('register', 'start', true);
                                        var registerData = {
                                            username: appConfig.deviceId,
                                            password: appConfig.defaultPass,
                                            deviceId: appConfig.deviceId
                                        };

                                        $logger.info('appResolve', 'registerData', registerData);

                                        $auth.register(registerData, function (err, result) {

                                            if (!result.success) {
                                                $logger.info('appResolve', 'register', result.message);
                                                cb(result.message, null);
                                            } else {

                                                $logger.info('appResolve', 'register', result);
                                                cb(null, result.data);
                                            }
                                        });
                                    }
                                }, function (userInfo, cb) {

                                    routes.getLastRoute(userInfo.id, function (err, result) {
                                        $rootScope.percentProcess = 100;

                                        if (result.length > 0) {

                                            switch (result[0].status) {
                                                case 0:
                                                    $logger.info('checkRoutes', 'status', 0, 'Handshaking with taxi');
                                                    taxi.setCurrentRoomID(result[0].roomID);
                                                    taxi.setCurrentStatus(1);
                                                    taxi.setDirectionInfo(result);

                                                    $rootScope.status.hasRouter = true;
                                                    // TODO: Taxi and customer handshake , and Taxi going to position of customer or Taxi and customer running
                                                    break;
                                                case 1:
                                                    $logger.info('checkRoutes', 'status', 1, 'Taxi and customer runing..');
                                                    //TODO : Taxi and customer running ....
                                                    taxi.setCurrentRoomID(result[0].roomID);
                                                    taxi.setCurrentStatus(1);
                                                    taxi.setDirectionInfo(result);

                                                    $rootScope.status.hasRouter = true;
                                                    break;
                                                case 2:

                                                    taxi.setCurrentStatus(0);
                                                    taxi.setDirectionInfo(null);
                                                    $logger.info('checkRoutes', 'status', 2, 'Routes done ! without problem');


                                                    $rootScope.status.hasRouter = false;
                                                    break;
                                                case 3:
                                                    taxi.setCurrentStatus(0);
                                                    taxi.setDirectionInfo(null);

                                                    $rootScope.status.hasRouter = false;
                                                    break;
                                                case 4:
                                                    taxi.setCurrentStatus(0);
                                                    taxi.setDirectionInfo(null);

                                                    $rootScope.status.hasRouter = false;
                                                    break;
                                            }
                                        } else {
                                            $rootScope.status.hasRouter = false;
                                            taxi.setCurrentStatus(0);
                                            taxi.setDirectionInfo(null);
                                        }

                                        cb(err, result);
                                    });
                                }],
                                function (err, result) {
                                    $rootScope.appResolved = true;

                                    $logger.info('App Resolve', 'success', true);

                                    setTimeout(function () {
                                        defer.resolve();
                                    }, 2000);

                                });

                        } else {

                            defer.resolve();
                        }


                        // NOT REMOVE

                        //  }, false);


                        /*} else {
                         $timeout(function () {
                         defer.resolve();
                         }, 1000);
                         }*/
                        //$rootScope.$state.go('app.login');
                        return defer.promise;
                    }
                    ]
                }
            })

            .
            state('contacts', {
                url: '/contacts',
                templateUrl: 'views/contacts.html'
            })

            .state('app.home', {
                url: '/home',
                views: {
                    'mainApp': {
                        templateUrl: 'views/states/home.html',
                        controller: 'HomeCtrl'
                    }
                },
                title: "<span>HUB</span>TAXI"
            })
            .state('app.page2G', {
                url: '/page2G',
                views: {
                    'mainApp': {
                        templateUrl: 'views/states/page2G.html',
                        controller: 'page2GCtrl'
                    }
                },
                title: 'iTaxi Home'
            })
            .state('app.register', {
                url: '/register',
                views: {
                    'mainApp': {
                        templateUrl: 'views/states/register.html',
                        'controller': 'RegisterCtrl'
                    }
                },
                title: 'Đăng ký'
            })
            .state('app.login', {
                url: '/login',
                views: {
                    'mainApp': {
                        templateUrl: 'views/states/login.html',
                        controller: 'LoginCtrl'
                    }
                },
                title: 'Đăng nhập'
            })
            /*.state('app.support', {
             url: '/support',
             views: {
             'mainApp': {
             templateUrl: 'views/states/support.html'
             }
             },
             title: 'Hướng dẫn'
             })*/
            .state('app.taxicompany', {
                url: '/taxicompany',
                views: {
                    'mainApp': {
                        templateUrl: 'views/states/taxicompany.html',
                        controller: 'TaxiCompanyCtrl'
                    }
                },
                title: 'Danh bạ Taxi'
            })
            .state('app.bookmark', {
                url: '/bookmark',
                views: {
                    'mainApp': {
                        templateUrl: 'views/states/bookmark.html',
                        controller: 'BookmarkCtrl'
                    }
                },
                title: 'Địa điểm yêu thích'
            })
            .state('app.companyDetail', {
                url: '/Company-detail/:id',
                views: {
                    'mainApp': {
                        templateUrl: 'views/states/Company-detail.html',
                        controller: 'companyDetailCtrl'
                    }
                },
                title: 'Thông tin taxi'
            })
            .state('app.history', {
                url: '/history',
                views: {
                    'mainApp': {
                        templateUrl: 'views/states/history.html',
                        controller: 'HistoryCtrl'
                    }
                },
                title: 'Lịch sử lộ trình'
            })
            .state('app.myTaxi', {
                url: '/myTaxi',
                views: {
                    'mainApp': {
                        templateUrl: 'views/states/mytaxi.html',
                        controller: 'myTaxiCtrl'
                    }
                },
                title: 'Taxi của tôi'
            })
            .state('app.message', {
                url: '/message',
                views: {
                    'mainApp': {
                        templateUrl: 'views/states/message.html',
                        controller: 'MessageCtrl'
                    }
                },
                title: 'Tin nhắn'

            })
            .state('app.messageDetail', {
                url: '/message-detail/:id',
                views: {
                    'mainApp': {
                        templateUrl: 'views/states/messageDetail.html',
                        controller: 'messageDetailCtrl'
                    }
                },
                title: 'Hộp thư'

            })
            .state('app.setting', {
                url: '/setting',
                views: {
                    'mainApp': {
                        templateUrl: 'views/states/setting.html',
                        controller: 'SettingCtrl'
                    }
                },
                title: 'Cài đặt'
            })
            .state('app.listTaxiAccept', {
                url: '/list-taxi-accept/:hasTaxi',
                views: {
                    'mainApp': {
                        templateUrl: 'views/states/child/list-taxi-accept.html',
                        controller: 'ListTaxiAcceptCtrl'
                    }
                },
                title: 'Danh sách taxi đồng ý'
            })
            .state('app.driverInfo', {
                url: '/driver-info/:id',
                views: {
                    'mainApp': {
                        templateUrl: 'views/states/child/driver-info.html',
                        controller: 'DriverInfoCtrl'
                    }
                },
                title: 'Thông tin tài xế'
            })
            .state('app.address', {
                url: '/address',
                views: {
                    'mainApp': {
                        templateUrl: 'views/states/address.html',
                        controller: 'addressCtrl'
                    }
                },
                title: 'Tính toán lộ trình'
            });


        $urlRouterProvider.otherwise("/home");

        /*console.log('-------------Hello Cordova------------------');
         console.log('-------------connect ' + JSON.stringify(window.connect));

         window.deviceReadyCallBack = function (data){
         console.log('deviceReadyCallBack');
         if (window.connect.WIFI || window.connect['3G']) {
         console.log('WFI or 3G');
         $urlRouterProvider.otherwise("/home");
         } else if(window.connect['2G']){
         console.log('2G');
         $urlRouterProvider.otherwise("/home");
         }else {
         console.log('123123'+JSON.stringify(window.connect));
         //$urlRouterProvider.otherwise("/page2G");
         $urlRouterProvider.otherwise("/home");
         //$urlRouterProvider.otherwise("/taxicompany");
         }
         };*/
        /*if (window.connect.WIFI || window.connect['3G']) {
         console.log('WFI or 3G');
         $urlRouterProvider.otherwise("/home");
         } else if(window.connect['2G']){
         console.log('2G');
         $urlRouterProvider.otherwise("/page2G");
         }else {
         console.log('123123'+JSON.stringify(window.connect));
         //$urlRouterProvider.otherwise("/page2G");
         $urlRouterProvider.otherwise("/taxicompany");
         }*/


        var interceptor = ['$rootScope', '$q', '$location', '$logger', function ($rootScope, $q, $location, $logger) {


            var success = function (response) {
                return response;
            };

            var error = function (response) {
                var status = response.status;
                var config = response.config;
                var method = config.method;
                var url = config.url;

                if (400 <= status && status <= 499) {
                    $logger.moduleName = 'HttpException Module';
                    var errMsg = 'Method: ' + method + ', url: ' + url + ', status: ' + status;
                    $logger.error(errMsg);
                    if (status === 403 || status === 401) {
                        //$location.path('/login');
                        $logger.info('Authorize', 'passed', false);
                        $rootScope.$broadcast('unauthorize');
                    }
                }

                return $q.reject(response);
            };

            return function (promise) {
                return promise.then(success, error);
            };
        }];

        $httpProvider.responseInterceptors.push(interceptor);


    })
    .
    run(['$ionicPlatform', '$rootScope', '$http', 'appConfig', '$auth', '$logger', 'taxi', 'loggerConfig', '$state', '$stateParams', '$timeout', '$ionicLoading', 'routes', '$ionicPopup', '$filter',

        function ($ionicPlatform, $rootScope, $http, appConfig, $auth, $logger, taxi, loggerConfig, $state, $stateParams, $timeout, $ionicLoading, routes, $ionicPopup, $filter) {


            /*alert('app runing' + appConfig.apiHost);*/

            appConfig.deviceId = (window.device) ? device.uuid.toLowerCase() : 'HubTaxi2';
            console.log('appConfig.deviceId  :',appConfig.deviceId);

            $rootScope.appConfig = appConfig;
            $rootScope.pageTitleCalu = '';

            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
            $rootScope.appResolved = false;
            $rootScope.homeLoaded = false;
            $rootScope.listTaxiMenuRight = [];
            $rootScope.messageData = [];
            $rootScope.stepDirection = [];
            $rootScope.myActiveSlide = 1;
            $rootScope.resultPlace = [];
            $rootScope.placeInput = true;
            $rootScope.watingTaxi = false;

            $rootScope.isLogin = $auth.isLogin();

            // $rootScope.startPoint = '1'

            $rootScope.endPoint = '';

            $rootScope.routeCaculator = '';


            /*
             * Model of destinationInput and originInput in home
             * */

            $rootScope.originInput = '';
            $rootScope.destinationInput = '';


            $rootScope.status = {
                hasDriveAccept: false,                   // TODO: Trạng thái khi có Taxi chấp nhận
                customerCalling: false,                  // TODO: Trạng thái customer đang gọi taxi
                hasRouter: false,                         // TODO: Trạng thái khi có lộ trình
                callCounter: 0,                          // TODO: Đếm ngược khi gọi taxi
                showCounter: false,                      // TODO: ẨN hiện đếm ngược
                taxiAccepted: false,                     // TODO: Trạng thái khi taxi đã đồng ý
                showListTaxi: false,                     // TODO: Hiển trị danh sách taxi
                readMess: false,                         // TODO: Trạng thái read và unread message
                callTaxiProcess: false,                  // TODO: Trạng thái đang xử lý khi gọi taxi
                chooseTaxiProcess: false,                // TODO:
                tickPositon: false,                      // TODO: Gim vị trí
                showStatusBar: false,                    // TODO: Ẩn hiện status bar
                pinPosition: false,
                showMapLoading: false
            };


            /*
             * TODO not remove
             * */
            $rootScope.dot = ' .';
            var dotAnimate = function () {

                setInterval(function () {

                    if ($rootScope.dot.length == 3) {
                        $rootScope.dot = ' .';
                    } else {
                        $rootScope.dot += '.';
                    }

                }, 1000)
            };

            $rootScope.mapLoading = function () {
                $rootScope.status.showMapLoading = true;
                $rootScope.mapLoadingContent = 'Đang tải bản đồ ...';
            };

            $rootScope.hideMapLoading = function () {
                setTimeout(function () {
                    $rootScope.mapLoadingContent = '';
                    $rootScope.status.showMapLoading = false;
                }, 500);


            };
            $rootScope.offStatus = function () {
                $rootScope.status.showStatusBar = false;
            }
            $rootScope.showStatus = function (content, hasDot) { // Show and hide notification loading

                $rootScope.status.showStatusBar = true;
                if (!content) {
                    $rootScope.statusContent = 'Đang tải dữ liệu ...';
                } else {
                    $rootScope.statusContent = content;
                }
            };

            $rootScope.hideStatus = function () {
                console.log('$rootScope.status.showStatusBar', $rootScope.status.showStatusBar);
                $rootScope.statusContent = '';
                $rootScope.status.showStatusBar = false;

                $rootScope.$apply(function () {

                });


            };


            /*
             * Check user is login then set user info to scope
             * */


            // Ionic require

            $ionicPlatform.ready(function () {
                if (window.StatusBar) {
                    window.StatusBar.styleDefault();
                }
            });


            /*
             * Function when exit app
             * */
            function out() {
                navigator.notification.confirm(
                    'Bạn muốn thoát ứng dụng TaxiGo!', // message
                    function (button) {
                        if (button == 1) {
                            if (navigator.app) {
                                navigator.app.exitApp();
                            }
                            else if (navigator.device) {
                                navigator.device.exitApp();
                            } else {
                                alert('Thiết bị của bạn không phải là Device');
                            }
                        }
                    },
                    'Đóng ứng dụng',           // title
                    ['Thoát', 'Trở lại']         // buttonLabels
                );
            }


            $rootScope.closeApp = function () {
                if (navigator.notification) {
                    out();
                } else {
                    alert('Thoát ứng dụng được hỗ trợ trên App! xin cảm ơn');
                }
            };

            var SmartPhone = {
                getUserAgent: function () {
                    return navigator.userAgent;
                },
                isAndroid: function () {
                    return this.getUserAgent().match(/Android/i);
                },
                isBlackBerry: function () {
                    return this.getUserAgent().match(/BlackBerry/i);
                },
                isIOS: function () {
                    return this.getUserAgent().match(/iPhone|iPad|iPod/i);
                },
                isOpera: function () {
                    return this.getUserAgent().match(/Opera Mini/i);
                },
                isWindows: function () {
                    return this.isWindowsDesktop() || this.isWindowsMobile();
                },
                isWindowsMobile: function () {
                    return this.getUserAgent().match(/IEMobile/i);
                },
                isWindowsDesktop: function () {
                    return this.getUserAgent().match(/WPDesktop/i);
                    ;
                },
                isAny: function () {
                    var foundAny = false;
                    var getAllMethods = Object.getOwnPropertyNames(SmartPhone).filter(function (property) {
                        return typeof SmartPhone[property] == 'function';
                    });

                    for (var index in getAllMethods) {
                        if (getAllMethods[index] === 'getUserAgent' || getAllMethods[index] === 'isAny' || getAllMethods[index] === 'isWindows') {
                            continue;
                        }
                        if (SmartPhone[getAllMethods[index]]()) {
                            foundAny = true;
                            break;
                        }
                    }
                    return foundAny;
                }
            };

            $logger.info('', 'isAndroid : ', SmartPhone.isAndroid());

            if (SmartPhone.isAndroid()) {
                $rootScope.checkAndroid = '';
                $logger.info('', 'isAndroid : ',true);
            }
            if (SmartPhone.isIOS()) {
                $rootScope.checkAndroid = 'sidebar-right-loading';
            }
            if (SmartPhone.isBlackBerry()) {
                $rootScope.checkAndroid = 'sidebar-right-loading';
            }

            $rootScope.checkConnection = function () {
                if (navigator.network.connection.type == Connection.NONE) {
                    alert('No internet access !');
                    $state.go('contacts');
                    return false;
                } else if (navigator.network.connection.type == Connection.CELL_2G) {
                    //alert('Kết nối mạng của bạn là 2G! \nĐiều hướng tới danh sách Taxi xung quanh');
                    alert('Connection type is 2G');
                    $state.go('contacts');
                    return false;
                } else {
                    return true;
                }
            };

            /*
             * function get images link if have url then return full link of media else return default images
             * */

            $rootScope.getImgUrl = function (url) {
                if (url) {
                    return appConfig.mediaHost + "/" + url;
                } else {
                    return './images/no-avt.jpg';
                }
            };
            $rootScope.getImgUrlDefault = function (url) {
                if (url) {
                    return appConfig.mediaHost + "/" + url;
                } else {
                    return './images/no-avt.jpg';
                }
            };

            $rootScope.logout = function () {
                $auth.logout(function (resp) {
                    if (resp) {
                        $rootScope.isLogin = false;
                        $state.go('app.home');
                        $rootScope.notify('Đăng xuất thành công !');

                    } else {
                    }
                })
            };


            /*
             * Check if not have window.socketIo then connect to socket.io server else disconnect and reconect to socket.io server
             * */
            if (!window.socketIo) {
                window.socketIo = window.io.connect(appConfig.apiHost + '/?token=null');
            } else {
                window.io.disconnect();
                window.socketIo = window.io.connect(appConfig.apiHost + '/?token=null');
            }


            /*
             * Listen event when state change
             * */
            $rootScope.$on('$stateChangeStart', function (event, to, toParams) {

                $logger.info('$stateChangeStart', 'token', $auth.getToken());

                $logger.info('$stateChangeStart', 'isLogin', $auth.isLogin());

                /*
                 *   dynamic set page title when state change
                 * */

                if ($rootScope.isLogin) {
                    $rootScope.currentUserInfo = $auth.getAppRegisterInfo();
                }


                if (to.title) {
                    $rootScope.pageTitleCalu = to.title;
                } else {
                    $rootScope.pageTitleCalu = '';
                }

                if (!window.socketIo) {
                    $auth.connectSocketIo(function (result) {
                        $logger.info('$stateChangeStart', 'connectSocketIo', result);
                    });
                }

                if ($auth.getCurrentUser() === null) {
                    $auth.pendingStateChange = {
                        to: to,
                        toParams: toParams
                    };
                    $logger.info('$stateChangeStart', 'current user is NULL', true);
                }


                if (to.accessLevel === undefined || $auth.$authorize(to.accessLevel)) {
                    $logger.info('$stateChangeStart', '$authorized', true);

                } else {
                    $logger.info('$stateChangeStart', 'unauthorized - preventDefault', true);
                    event.preventDefault();
                }
            });


            $rootScope.goToPage = function (view, id) {
                if (id) {
                    $state.go(view, id);
                }
                else
                    $state.go(view);
            };

            $rootScope.loadingIndicator = null;
            //$rootScope.myTitle = 'Template';

            /*
             * Notification
             * */

            $rootScope.notify = function (content, notTimeout) {
                console.log('content :', content);
                $rootScope.loadingIndicator = $ionicLoading.show({
                    template: content,
                    noBackdrop: true
                });
                if (!notTimeout) {
                    $timeout(function () {
                        $ionicLoading.hide();

                    }, 3000);
                } else {
                    $timeout(function () {
                        $ionicLoading.hide();

                    }, notTimeout);
                }
            };
            $rootScope.dem = 1;
            $rootScope.hideNotify = function () {
                $rootScope.loadingIndicator.hide();
            };

            /*
             * Action Call when click to TaxiCompany
             * */
            /* Offline.options = {
             checkOnLoad: false,
             interceptRequests: true,
             reconnect: {

             initialDelay: 3
             },
             requests: true,
             game: false,
             checks: {xhr: {url: 'http://chris-ictu.tk:6868/api/Drivers'}}
             };
             var timeT = 0;
             Offline.on('reconnect:tick', function () {
             if($rootScope.checkTry){

             };
             });
             Offline.on('down', function () {
             console.log('Không có kết nối mạng :', true);
             var alertConfirm = function (buttonIndex) {
             if (buttonIndex == 1) {
             navigator.app.exitApp();
             } else {
             $rootScope.$apply(function () {
             $rootScope.checkTry = true;
             });
             }
             };
             if (navigator.notification) {
             navigator.notification.confirm(
             'Đã mất kết nối mạng,ấn Thoát để đóng ứng dụng hay dùng với trạng thái mấ tmạng', // message
             alertConfirm,
             'Không có kết nối mạng',
             ['Thoát', 'Tiếp tục']
             );
             } else {

             }

             });
             */
            $rootScope.showConfirm = function (data) {
                window.location = "tel:" + data.call;
            };
            $rootScope.callTaxiQuick = function (taxi) {
                console.log('callTaxiQuick', 'start', taxi);
                $ionicPopup.show({
                    title: 'Lái xe : ' + taxi.taxi + " Hãng: " + taxi.carLic,
                    subTitle: 'Bạn có muốn gọi taxi này?',
                    scope: $rootScope,
                    buttons: [
                        { text: 'Để sau', onTap: function (e) {
                            //2
                        } },
                        {
                            text: '<b>Gọi</b>',
                            type: 'button-positive',
                            onTap: function (e) {
                                //1
                                $rootScope.quickChooseTaxi(taxi);
                            }
                        }
                    ]
                }).then(function (res) {
                    console.log('Tapped!', res);
                }, function (err) {
                    console.log('Err:', err);
                }, function (msg) {
                    console.log('message:', msg);
                });
            };

            if (taxi.getDirectionInfo()) {
                $rootScope.idTaxi = taxi.getDirectionInfo()[0].driver.id;

                //console.log(taxi.getDirectionInfo()[0]);
            } else {
                $rootScope.idTaxi = 0;
            }

            /*
             * Action when customer choose taxi
             * */
            $rootScope.pageTitleCalu = "HubTaxi";
            $rootScope.chooseTaxi = function (taxiData) {

                $rootScope.status.chooseTaxiProcess = true;

                routes.chooseTaxi(taxiData, false, function (err, result) {
                    $rootScope.status.chooseTaxiProcess = false;
                    if (err) {
                        // TODO : Do something
                    } else {
                        $rootScope.watingTaxi = true;
                        $rootScope.showStatus("Đang đợi taxi đón ...", true);

                        if ($rootScope.stepDirection && $rootScope.distanceCheck) {
                            var statusBarContent = '';
                            var distance = $rootScope.distanceCheck;
                            var res = Number(distance / 1000);

                            $rootScope.checkcompany = true;
                            if (res <= taxiData.company.firstKm) {

                                statusBarContent = taxiData.company.companyName + " : " + res + " Km - Giá :" + taxiData.company.firstPrice + " VNĐ";

                            } else if (res <= taxiData.company.middleKm) {
                                statusBarContent = taxiData.company.companyName + " : " + res + " Km - Giá :" + Math.round(taxiData.company.firstPrice + ((res - taxiData.company.firstKm ) * taxiData.company.middlePrice)) + " VNĐ";
                            } else {
                                statusBarContent = taxiData.company.companyName + " : " + res + " Km - Giá :" + $filter('currency')(Math.round(taxiData.company.firstPrice
                                    + (taxiData.company.middleKm - taxiData.company.firstKm) * taxiData.company.firstPrice
                                    + (res - taxiData.company.middleKm) * taxiData.company.lastPrice), "VNĐ");
                            }

                            /*setTimeout(function () {*/

                            /*}, 5000);*/
                            $rootScope.routeCaculator = statusBarContent;
                            $rootScope.pageTitleCalu = statusBarContent

                        }
                        $logger.info('chooseTaxi', 'success', true);
                        $rootScope.status.hasRouter = true;
                        $rootScope.status.showListTaxi = true;
                        $rootScope.status.hasDriveAccept = false;

                        /*$rootScope.idTaxi = taxiData.id;*/


                        $rootScope.notify('Lái xe đã nhận được yêu cầu! vui lòng đợi trong giây lát');
                        $state.go('app.home');
                    }
                });
            };
            $rootScope.customerCalling = true;

            /*
             * Listen event when user not authorize
             * */
            $rootScope.$on('unauthorize', function () {
                $auth.clearToken();
                $auth.clearUser();
                $state.go('app.home');
            });

            document.addEventListener("offline", function () {
                $rootScope.statusContent = 'Không có kết nối mạng';
            });
            $auth.setHeaderToken();

        }]).directive('resizeHeight', function ($window, $rootScope) {
        return function (scope, element) {

            scope.getWinWidth = function () {
                return $window.innerHeight;
            };

            var setNavHeight = function (newPosition) {
                var x = newPosition - 45;
                element.css('marginTop', x + 'px');
            };

            // Set on load
            var test = function (newValue, oldValue) {
                var newPosition = (scope.getWinWidth() / 2) - (element[0].clientHeight / 2);
                setNavHeight(newPosition);
            };

            test();
        };
    });

