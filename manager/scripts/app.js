'use strict';

angular
    .module('itaxiManagerApp', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngRoute',
        'ngAnimate',
        'ui.bootstrap',
        'ui.router',
        'framework.vsoft',
        'pasvaz.bindonce',
        'angularMoment',
        'angularFileUpload',
        'LocalStorageModule',
        'pascalprecht.translate',
        'ngProgress',
        'jp.ng-bs-animated-button',
        'textAngular',
        'infinite-scroll'
    ])
    .config(function ($stateProvider, $urlRouterProvider, $httpProvider, $translateProvider) {

        // Translate API.
//        $translateProvider.translations('en', {
//            'Hello': 'Xin chào',
//            'How are you?': 'Bạn khỏe không?'
//        });
//
//        $translateProvider.translations('de', {
//            'TITLE': 'Hallo',
//            'FOO': 'Dies ist ein Paragraph'
//        });
//
//        $translateProvider.preferredLanguage('en');


        $urlRouterProvider.otherwise("/main");

        $stateProvider
            .state('main', {
                url: "/main",
                templateUrl: "views/main.html",
                abstract: true,
                accessLevel: window.userCan.accessManager
            })
            .state('main.googlemap', {
                url: "",
                templateUrl: 'views/maps/google-map.html',
                controller: 'googleMapCtrl',
                accessLevel: window.userCan.accessManager
            })
            .state('main.overview', {
                url: "/overview",
                templateUrl: 'views/dashboard/overview.html',
                controller: 'overviewCtrl',
                accessLevel: window.userCan.accessManager
            })
            .state('main.crm', {
                url: "/crm",
                templateUrl: 'views/crm/crm.html',
                controller: 'crmCtrl',
                accessLevel: window.userCan.accessManager

            })
            .state('main.crm.dagui', {
                url: "/dagui",
                templateUrl: 'views/crm/multi-views-crm/dagui.html',
                accessLevel: window.userCan.accessManager
            })
            .state('main.crm.chuagui', {
                url: "/chuagui",
                templateUrl: 'views/crm/multi-views-crm/chuagui.html',
                accessLevel: window.userCan.accessManager
            })
            .state('main.managerCarType', {
                url: "/managerCarType",
                templateUrl: 'views/cartype/managerCarType.html',
                controller: 'managerHrCtrl',
                accessLevel: window.userCan.accessManager
            })
            .state('main.settings', {
                url: "/settings",
                templateUrl: 'views/setting.html',
                controller: 'settingCtrl',
                accessLevel: window.userCan.accessManager
            })
            .state('main.detailCarType', {
                url: "/detailCarType/:id",
                templateUrl: 'views/cartype/detailtCarType.html',
                controller: 'detailtHrCtrl',
                accessLevel: window.userCan.accessManager
            })
            .state('main.managerDriving', {
                url: "/managerDriving",
                templateUrl: 'views/driving/managerDriving.html',
                controller: 'managerDrivingCtrl',
                accessLevel: window.userCan.accessManager
            })
            .state('main.detailDriving', {
                url: "/detailDriving/:id",
                templateUrl: 'views/driving/detailtDriving.html',
                controller: 'detailtDrivingCtrl',
                accessLevel: window.userCan.accessManager
            })
            .state('main.managerCustomer', {
                url: "/managerCustomer",
                templateUrl: 'views/customer/managerCustomer.html',
                controller: 'managerCustomerCtrl',
                accessLevel: window.userCan.accessManager
            })
            .state('main.routeHistory', {
                url: "/routeHistory",
                templateUrl: 'views/routeHistory.html',
                controller: 'routeHistoryCtrl',
                accessLevel: window.userCan.accessManager
            })
            .state('main.detailCustomer', {
                url: "/detailCustomer/:id",
                templateUrl: 'views/customer/detailCustomer.html',
                controller: 'detailCustomerCtrl',
                accessLevel: window.userCan.accessManager
            })
            .state('main.reportSystem', {
                url: "/reportSystem",
                templateUrl: 'views/report/reportSystem.html',
                controller: 'reportSystemCtrl',
                accessLevel: window.userCan.accessManager
            })
            .state('main.detailCrm', {
                url: "/detailCrm",
                templateUrl: 'views/crm/detail-crm.html',
                controller: 'detailCrmCtrl',
                accessLevel: window.userCan.accessManager
            })
            .state('login', {
                url: "/login",
                templateUrl: 'views/login.html',
                controller: 'loginCtrl'
            });

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

        $urlRouterProvider.otherwise("/login");

    })
    .run(['$rootScope', '$upload', 'appConfig', '$logger', '$auth', '$state', '$stateParams', 'appDataStore', '$fetchData', '$baseModel', 'ngProgress',
        function ($rootScope, $upload, appConfig, $logger, $auth, $state, $stateParams, appDataStore, $fetchData, $baseModel, ngProgress) {
            $rootScope.appConfig = appConfig;
            $rootScope.userInfo = $auth.getUser();
            $rootScope.getApp = {
                name: "HubTaxi"
            };


            $rootScope.onFileSelect = function ($files, driving) {
                ngProgress.start();

                console.log($files);
                for (var i = 0; i < $files.length; i++) {
                    var file = $files[i];
                    $rootScope.upload = $upload.upload({
                        url: 'http://vsoft.vn:1235/upload', // upload.php script, node.js route, or servlet url
                        method: 'POST', // or 'PUT',

                        data: {myObj: $rootScope.myModelObj},
                        file: file // or list of files: $files for html5 only

                    }).progress(function (evt) {

                    }).success(function (data, status, headers, config) {
                        ngProgress.complete();

                        ngProgress.color('#4DABDC');
                        // file is uploaded successfully
                        if (driving.logo) {
                            driving.logo = data.data.resize;
                            driving = new $baseModel('TaxiCompany', driving);
                        } else {
                            driving.avatar = data.data.resize;
                        }
                        driving.save(function (err, result) {
                            if (err) {
                                console.log('Lỗi: ', err)
                            } else {
                                toastr.success('Thay đổi ảnh thành công');
                                appDataStore.Drivings.update(driving);
                            }
                        })
                    });
                }
            };

            $rootScope.checkAvatar = function (avatarUrl) {
                if (avatarUrl) {
                    return appConfig.mediaHost + avatarUrl;
                } else {
                    return 'http://eng.sut.ac.th/ae/engsut/sites/default/files/imagefield_default_images/default_user_avatar_thumb.png';
                }
            };

            $rootScope.$on('$stateChangeStart', function (event, to, toParams, fromState) {
                $logger.info('$stateChangeStart', 'token', $auth.getToken());
                $logger.info('$stateChangeStart', 'user', $auth.isLogin());


                $rootScope.$previousState = fromState;
                $rootScope.$state = $state;
                $rootScope.$stateParams = $stateParams;


                if (!window.socketIo && $auth.isLogin()) {

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


                if (to.name == 'login' && $auth.isLogin()) {
                    event.preventDefault();
                    $state.go('main.googlemap');
                }

                if (to.accessLevel === undefined || $auth.authorize(to.accessLevel)) {
                    $logger.info('$stateChangeStart', 'authorized', true);


                } else {
                    $logger.info('$stateChangeStart', 'unauthorized - preventDefault', true);
                    event.preventDefault();
                    $state.go('login');
                }
            });

            $rootScope.$on('unauthorize', function () {

                $auth.logout(function (resp) {
                    if (resp) {
                        for (var property in appDataStore) {
                            if (appDataStore.hasOwnProperty(property)) {
                                appDataStore[property].removeAll();
                            }
                        }
                        $state.go('login');
                    }
                });


            });

            $rootScope.logout = function () {
                $rootScope.classPost = 'off';
                $auth.logout(function (success) {
                    if (success) {
                        $state.go('login');
                        for (var property in appDataStore) {
                            if (appDataStore.hasOwnProperty(property)) {
                                appDataStore[property].removeAll();
                            }
                        }
                    } else {
                        console.log('failed to logout!');
                    }
                });
            };

            $rootScope.gotoPage = function (url, id) {
                if (id) {
                    $state.go(url, id)
                } else {
                    $state.go(url);
                }
            };

            toastr.options = {
                positionClass: "toast-bottom-right"
            };

            $auth.setHeaderToken();


        }]);





