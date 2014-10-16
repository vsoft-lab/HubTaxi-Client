'use strict';

angular.module('taxigoDriverApp')
    .factory('auth', ['$resource', '$http', '$cookieStore', '$rootScope', 'localStorageService', 'logger', '$q', 'config', 'fetchData', 'restful',
        function ($resource, $http, $cookieStore, $rootScope, localStorageService, $logger, $q, appConfig, $fetchData, $restful) {

            /**
             * setting for $logger Factory
             *
             * @param {string} moduleName Module Name
             * @param {boolean} disableLog.info Enable or Disable info log
             * @param {boolean} disableLog.error Enable or Disable error log
             */

            $logger.moduleName = 'Auth Factory';

            var _userKey = 'user';
            var _tokenKey = 'token';
            var _lastLoginNameKey = 'lastLoginName';
            var _authorizationKey = 'Authorization';
            var _appRegisterInfo = 'appRegisterInfo';
            var _firstLogon = 'firstLogon1';
            var _phoneNumber = 'phoneNumber';

            var _setHeaderToken = function (token) {
                $http.defaults.headers.common[_authorizationKey] = token;

                $logger.info('_setHeaderToken', 'done', true);
            };

            var _clearHeaderToken = function () {
                $http.defaults.headers.common[_authorizationKey] = null;

                $logger.info('_clearHeaderToken', 'done', true);
            };

            return {
                pendingStateChange: null,


                clearCurrentUser: function () {
                    this.clearUser();

                    $logger.info('clearCurrentUser', 'done', true);
                },

                setCurrentUser: function (user) {
                    user.nextState = 'nodejs.main.home';

                    this.setUser(user);

                    $logger.info('setCurrentUser', 'done', true);
                },

                getCurrentUser: function () {
                    var user = this.getUser();
                    var userRole = this.getUserRole();

                    if (user && userRole) {
                        if (userRole.title === 'admin' || userRole.title === 'manager') {
                            user.nextState = 'nodejs.admin';
                        }
                        if (userRole.title === 'user') {
                            user.nextState = 'nodejs.main.home';
                        }
                        if (userRole.title === 'kitchen' || userRole.title === 'bar') {
                            user.nextState = 'bell.monitor-bar.monitor';
                        }
                    }

                    $logger.info('getCurrentUser', 'done', true);
                    return user;
                },
                clearUser: function () {
                    /*this.user = null;*/
                    //$cookieStore.put(_userKey, null);
                    //$cookieStore.remove(_userKey);

                    localStorageService.set(_userKey, null);
                },

                /*
                 setUser: function (user) {
                 this.user = user;
                 },
                 */

                setUser: function (user) {

                    //$cookieStore.put(_userKey, JSON.stringify(user));

                    //sessionStorage[_userKey] = JSON.stringify(user);
                    localStorageService.set(_userKey, user);
                },

                /*
                 getUser: function () {
                 return this.user || null;

                 },
                 */

                getUser: function () {
                    //var cachedUser = $cookieStore.get(_userKey);

                    var cachedUser = localStorageService.get(_userKey);

                    if (!!cachedUser) {
                        return cachedUser;
                    }

                    return null;

                },
                setToken: function (token) {
                    if (token) {
                        _setHeaderToken(token);
                        localStorageService.set(_tokenKey, token);
                        //$cookieStore.put(_tokenKey, token);
                    } else {
                        _setHeaderToken(null);
                        localStorageService.set(_tokenKey, null);
                        //$cookieStore.put(_tokenKey, null);
                    }

                    //sessionStorage[_tokenKey] = token;
                    //localStorageService.set(_tokenKey, token);
                },

                getToken: function () {
                    return localStorageService.get(_tokenKey);
                },

                clearToken: function () {
                    _clearHeaderToken();
                    //$cookieStore.put(_tokenKey, null);
                    localStorageService.set(_tokenKey, null);
                },

                setHeaderToken: function () {
                    var token = this.getToken();

                    if (token) {
                        _setHeaderToken(token);
                    } else {
                        _setHeaderToken(null);
                    }

                    $logger.info('setHeaderToken', 'done', true);
                },
                getHeaderToken: function () {
                    var token = $http.defaults.headers.common[_authorizationKey];
                    if (token) {
                        return token;
                    } else {
                        return null;
                    }
                },

                assignSocketIoEvent: function (callBack) {
                    window.socketIo.on('connect', function () {
                        $logger.info('connectSocketIo', 'established a working and authorized connection success', true);

                        (callBack && typeof callBack == 'function') ? callBack(true) : null;

                    });

                    window.socketIo.on('disconnect', function () {
                        $logger.info('connectSocketIo', 'disconnect by some reason', true);
                    });

                    window.socketIo.on('error', function (reason) {
                        $logger.error('connectSocketIo', 'error', reason);

                        callBack(false);
                    });
                },

                connectSocketIo: function (callBack) {
                    $logger.info('connectSocketIo', 'starting', true);

                    /*var token = this.getToken();*/
                    var token = this.getHeaderToken();

                    if (!window.socketIo) {
                        $logger.info('connectSocketIo', 'connect first time', true);
                        window.socketIo = window.io.connect(appConfig.apiHost + '/?token=' + token, {'force new connection': true});

                        this.assignSocketIoEvent(callBack);
                    } else {
                        window.socketIo.disconnect();
                        $logger.info('connectSocketIo', 'disconnect', true);

                        window.socketIo = window.io.connect(appConfig.apiHost + '/?token=' + token, {'force new connection': true});
                        $logger.info('connectSocketIo', 're-connect', true);

                        this.assignSocketIoEvent(callBack);
                    }


                },

                resolvePendingState: function (httpPromise) {
                    var _functionName = 'resolvePendingState';
                    $logger.info(_functionName, 'starting', true);

                    var checkUser = $q.defer();
                    var me = this;
                    var pendingState = me.pendingStateChange;

                    httpPromise
                        .success(function (data) {
                            if (data.success) {
                                me.setCurrentUser(data.user);

                                if (pendingState.to.accessLevel === undefined || me.authorize(pendingState.to.accessLevel)) {
                                    $logger.info(_functionName, 'success and authorized', true);

                                    checkUser.resolve();
                                } else {
                                    $logger.info(_functionName, 'success BUT Unauthorized', true);

                                    checkUser.reject('unauthorized'); // may be 403
                                }
                            } else {
                                checkUser.reject('401');

                                $logger.info(_functionName, 'error', data.message);
                            }
                        })
                        .error(function (err, status, headers, config) {
                            checkUser.reject(status.toString());

                            $logger.info(_functionName, 'error', err);
                        });

                    me.pendingStateChange = null;
                    return checkUser.promise;
                },
                register: function (data, cb) {
                    var me = this;
                    var registerData = {
                        username: data.username.toLowerCase(),
                        password: data.password,
                        deviceId: data.deviceId
                    };
                    $http(
                        {
                            'method': 'POST',
                            'data': registerData,
                            'url': appConfig.apiHost + '/register'
                        })
                        .success(function (data) {
                            /*console.log('data', data);*/
                            me.setAppRegister(data.data);
                            cb(null, data);
                        })
                        .error(function (err) {
                            cb(err, null);
                        });
                },
                updateUserInfo: function (data, cb) {
                    var me = this;
                    var registerData = {
                        username: data.username.toLowerCase(),
                        password: data.password,
                        userId: me.getAppRegisterInfo().id,
                        deviceId: appConfig.deviceId,
                        fullname: data.fullname,
                        phone: data.phone,
                        birthday: data.birthday,
                        location: data.location
                    };
                    $http(
                        {
                            'method': 'POST',
                            'data': registerData,
                            'url': appConfig.apiHost + '/registerCustomer'
                        })
                        .success(function (data) {
                            /*console.log('data', data);*/
                            //me.setAppRegister(data.data);
                            cb(null, data);
                        })
                        .error(function (err) {
                            cb(err, null);
                        });
                },
                getUserInfoByDeviceId: function (cb) {
                    var deviceId = appConfig.deviceId;
                    var filter = [
                        {
                            property: 'deviceId',
                            value: deviceId,
                            type: 'string',
                            comparison: 'eq'
                        }
                    ];


                    $restful.get({table: 'Users', start: 0, limit: 1000, filter: JSON.stringify(filter)}, function (resp) {
                        if (resp.success) {
                            cb(null, resp.data);
                        } else {
                            cb(resp.message, null);
                        }

                    });

                },
                login: function (username, password, cb) {
                    var me = this;
                    $rootScope.crudProcessing = true;
                    $http(
                        {
                            'method': 'POST',
                            'data': {'username': username, 'password': password},
                            'url': appConfig.apiHost + '/driverLogin'
                        })
                        .success(function (data) { //.success(function(data, status, headers, config)
                            $logger.info('login', 'success', true);

                            var user = data.user;
                            var token = data.token;

                            me.setCurrentUser(user);
                            me.setToken(token);
                            me.setLastLoginName();
                            me.pendingStateChange = null;


                            cb(null, data);
                        })
                        .error(function (err) {

                            $rootScope.crudProcessing = false;
                            $rootScope.loginError = err;

                            cb(err, null);
                        });
                },

                logout: function (callBack) {
                    var me = this;
                    $rootScope.logoutProcessing = true;

                    $http(
                        {
                            'method': 'POST',
                            'url': appConfig.apiHost + '/logout'
                        })
                        .success(function (data) {
                            $logger.info('logout', 'success', true);

                            window.socketIo.emit('taxi:logout', {carLic: me.getUserName()});

                            me.clearCurrentUser();
                            me.clearToken();


                            $logger.info('Authorize', 'logout', true);
                            $logger.info('Authorize', 'logout', me.getToken());


                            $rootScope.logoutProcessing = false;

                            callBack(true);
                        })
                        .error(function (err) {
                            $logger.error('logout', 'error', err);
                            $logger.info('Authorize', 'logout', false);
                            $rootScope.logoutProcessing = false;

                            callBack(false);
                        });
                },

                setLastLoginName: function () {
                    localStorageService.add(_lastLoginNameKey, this.getUserName());
                },

                getLastLoginName: function () {
                    return localStorageService.get(_lastLoginNameKey);
                },

                getUserId: function () {
                    var user = this.getUser();

                    if (!!user) {
                        return user.id;
                    }
                    return '';
                },

                getUserName: function () {
                    var user = this.getUser();

                    if (!!user) {
                        return user.name;
                    }
                    return '';
                },

                getUserFullName: function () {
                    var user = this.getUser();

                    if (!!user) {
                        return user.fullname;
                    }
                    return '';
                },

                getUserRole: function () {
                    var user = this.getUser();

                    if (!!user) {
                        return user.role;
                    }

                    return null;
                },

                getUserSite: function () {
                    var user = this.getUser();

                    if (!!user && user.site) {
                        return user.site;
                    }
                    return null;
                },

                authorize: function (accessLevel) {

                    var userRole = this.getUserRole();
                    if (null !== userRole) {
                        var result = accessLevel.bitMask <= userRole.bitMask;
                        return result;
                    } else {
                        return false;
                    }
                },
                isLogin: function () {
                    var userRole = this.getUserRole();

                    return (userRole) ? true : false;

                    /*if (!userRole) {
                     return false;
                     } else {
                     return true;
                     }*/
                },
                setAppRegister: function (appInfo) { // Register info with application
                    localStorageService.add(_appRegisterInfo, appInfo);
                },
                getAppRegisterInfo: function () {
                    return localStorageService.get(_appRegisterInfo);
                },
                setFirstLogon: function () { // Register info with application
                    localStorageService.add(_firstLogon, true);
                },
                isFirstLogon: function () {
                    return (localStorageService.get(_firstLogon)) ? true : false;
                },
                setRegisted: function () {
                    localStorageService.add('registed', true);
                },
                getRegisted: function () {
                    return (localStorageService.get('registed')) ? false : true;
                },
                setPhoneNumber: function (value) {
                    localStorageService.add(_phoneNumber, value);
                },
                getPhoneNumber: function () {
                    return localStorageService.get(_phoneNumber);
                }
            };
        }]);
