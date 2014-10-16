'use strict';

angular.module('taxigoDriverApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute' ,
    'ui.bootstrap',
    'ui.router',
    'LocalStorageModule',
    'ngCollection',
    'hmTouchEvents',
    'angularMoment'
])
    .config(['$stateProvider', '$urlRouterProvider', '$httpProvider', function ($stateProvider, $urlRouterProvider, $httpProvider) {

        /*Mọi truy cập không hợp lệ được điều hướng về index : */

        $urlRouterProvider.otherwise("/");

        /*Định ngĩa state trong TaxiGoDriver : */

        $stateProvider
            .state('taxiGoDriver', {

                /*Chỉ có token mới có thể truy cập (có quyên User)*/

                accessLevel: window.userCan.accessUser,

                /*Khai báo có view con thuộc view này */

                abstract: true,

                /* Khi view con có trạng thái url : "/" ngĩa là nó là đại diện cho view này khi hiển thị */
                url: "",
                templateUrl: 'views/main.html',
                controller: 'MainCtrl',
                resolve: {
                    'user': ['auth', '$q', '$http', 'config', 'logger', 'driver', '$timeout', 'routes', function (auth, $q, $http, config, logger, driver, $timeout, routes) {
                        logger.moduleName = 'Resolve App Loading State';
                        logger.info('Resolve App Loading State', 'start', true);
                        var defer = $q.defer();

                        routes.checkLastRoute(auth.getUserId(), function (err, result) {
                            defer.resolve();
                            if (err) {
                                //window.toastr.success('ERROR - APP: 45');
                                logger.info('ERRO', 'error', err);
                            } else {
                                logger.info('checkLastRoute', 'result', result);
                            }

                        });

                        return defer.promise;
                    }]
                }

            })
            .state('taxiGoDriver.home', {

                /*url : "/"  mặc định trang này sẽ được gọi ra khi state gọi (taxiGoDriver) */

                url: "/",
                templateUrl: 'views/Driver/home.html',

                /*Định ngĩa multi view ở đây : */

                views: {
                    "toolBar": {
                        templateUrl: "views/Driver/toolBar.html",
                        controller: "toolBarCtrl"
                    }
                },

                /*Quyền truy cập user */

                accessLevel: window.userCan.accessUser,
                controller: 'MainCtrl'
            })

            /*State login : */

            .state('login', {
                url: '/login',
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl'
            })

            .state('HistoryRoute', {
                url: '/history',
                templateUrl: 'views/Driver/driverHistory.html',
                controller: 'HistoryCtrl'
            });

        /*intercepter : định ngĩa những truy cập không được phép(đây là 1 thành phần của AngularJs) :*/


        var interceptor = ['$rootScope', '$q', '$location', 'logger', function ($rootScope, $q, $location, logger) {


            var success = function (response) {
                return response;
            };

            var error = function (response) {
                var status = response.status;
                var config = response.config;
                var method = config.method;
                var url = config.url;

                if (400 <= status && status <= 499) {
                    logger.moduleName = 'Application-Config';
                    var errMsg = 'Method: ' + method + ', url: ' + url + ', status: ' + status;

                    if (status === 403 || status === 401) {
                        //$location.path('/login');
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
    }])
    .run(['$rootScope', 'gmaps', '$http', 'config', 'auth', '$state', 'logger', 'driver', function ($rootScope, gmaps, $http, config, auth, $state, logger, driver) {

        /*Facetory : config*/

        // cm: nút hủy và nút bắt đầu mặc định là  không hiển thị

        $rootScope.acceptCustomer = false;
        $rootScope.acceptCustomerStart = false;


        $rootScope.config = config;

        $rootScope.isLogin = auth.isLogin();

        $rootScope.getIsLogin = function () {
            return auth.isLogin();
        };

        $rootScope.$watch('getIsLogin', function () {
            $rootScope.isLogin = $rootScope.getIsLogin();
        });


        var aliasNameModal;
        $rootScope.modal = function (name, disable, child) {
            if (aliasNameModal !== name) {
                if (aliasNameModal !== null || disable === 'true') {
                    angular.element(document.querySelector(aliasNameModal)).removeClass("on");
                }
                if (disable === 'active' && child) {
                    angular.element(document.querySelector('#toolBar ul li.li-active')).removeClass("li-active");
                    angular.element(document.querySelector('#toolBar ul li:nth-child(' + child + ')')).addClass("li-active");
                }

                if (name !== null) {
                    $rootScope.clickFormFalse = false;
                    angular.element(document.querySelector(name)).addClass("on");
                    aliasNameModal = name;
                } else {
                    console.log('Modal error: ', name);
                }
            }
            else {
                if (name == '#list') {

                } else {
                    angular.element(document.querySelector(aliasNameModal)).removeClass("on");
                    if (child) {
                        angular.element(document.querySelector('#toolBar ul li:nth-child(' + child + ')')).removeClass("li-active");
                    }
                }
                aliasNameModal = true;
                $rootScope.clickFormFalse = true;
            }

        };

        $rootScope.customerInfo = {};


        $rootScope.ListTaxiModalClass = 'right';
        $rootScope.historyClass = 'right';


        $rootScope.readMess = false;
        var nameInfo = 4;
        //var nameInfo = 5;

        $rootScope.switchListTaxi = function (status) {
            if (nameInfo != status) {
                if (status == 1) {
                    nameInfo = status;
                    angular.element(document.querySelector('#taxiIntro')).addClass("on");
                    $rootScope.ListTaxiModalClass = 'transition center';

                } else {
                    $rootScope.ListTaxiModalClass = 'transition right';
                }

                if (status == 3) {
                    angular.element(document.querySelector('#taxiIntro')).addClass("on");
                    $rootScope.ListTaxiModalClass = 'transition center';
                }
                //CM : 4 đóng animation
                if (status == 4) {
                    angular.element(document.querySelector('#taxiIntro')).removeClass("on");
                    $rootScope.ListTaxiModalClass = 'transition right';
                }

            } else {
                angular.element(document.querySelector('#taxiIntro')).removeClass("on");
                $rootScope.ListTaxiModalClass = 'transition right';
                nameInfo = 4;
            }
        };

        // cm : thực hiện show/hide history

        $rootScope.switchHistory = function (status) {
            console.log('you Click history....', status);
            if (status == 1) {
                nameInfo = status;
                $rootScope.historyClass = 'transition center';

            } else {
                $rootScope.historyClass = 'transition right';
            }

        };

        /*if (!window.socketIo) {
         window.socketIo = window.io.connect(config.apiHost + '/?token=null');
         } else {
         window.io.disconnect();
         window.socketIo = window.io.connect(config.apiHost + '/?token=null');
         }*/

        /* Kiểm tra Token : */


        $rootScope.$on('$stateChangeStart', function (event, to, toParams) {

            logger.info('$stateChangeStart', 'token', auth.getToken());
            logger.info('$stateChangeStart', 'user', auth.isLogin());


            if (!window.socketIo && auth.isLogin()) {
                auth.connectSocketIo(function (result) {
                    logger.info('$stateChangeStart', 'connectSocketIo', result);
                });
            }


            if (auth.getCurrentUser() === null) {
                auth.pendingStateChange = {
                    to: to,
                    toParams: toParams
                };
                logger.info('$stateChangeStart', 'current user is NULL', true);
            }


            if (to.accessLevel === undefined || auth.authorize(to.accessLevel)) {
                logger.info('$stateChangeStart', 'authorized', true);

            } else {
                logger.info('$stateChangeStart', 'unauthorized - preventDefault', true);
                event.preventDefault();
                $state.go('login');
            }
        });

        $rootScope.tooltip = {
            content: '',
            timeout: 3000,
            element: null,
            open: function (content, timeout) {
                var me = this;
                me.element = angular.element(document.querySelector('#toolTip'));
                me.close();

                me.timeout = (timeout) ? timeout : me.timeout;
                me.element.addClass('on');
                me.content = content;

                setTimeout(function () {
                    me.element.removeClass('on');
                }, me.timeout)
            },
            close: function (timeout) {
                this.element.removeClass('on');
            }
        };


        $rootScope.$on('unauthorize', function () {
            auth.clearToken();
            auth.clearUser();
            console.log('Login False!!!');
            $state.go('login');
        });

        auth.setHeaderToken();
    }]);
