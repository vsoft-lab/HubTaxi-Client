/**
 * @overview VSOFT Module.
 * @copyright VSOFT SOLUTION 2014
 * @version 0.0.1 - 2014-03-26
 */


/**
 * @module frameworkVsoft
 * @description Parrent của @module ui.vsoft và core.vsoft
 */

angular.module('framework.vsoft', ['ui.vsoft', 'core.vsoft'])
/**
 * @memberOf frameworkVsoft
 * @function appConfig
 * @description Chứa các thuộc tính cấu hình hệ thống !
 * @param {String} deviceId ID của device
 * @param {String} apiHost Địa chỉ của server REST API
 * @param {String} mediaHost Địa chỉ server chứa media
 */
    .constant('appConfig', {
/*
        deviceId: (window.device) ? device.uuid.toString().toLowerCase() : '99b999b99b99b',
*/
        defaultPass: 'defaultPassword',
        name: 'iTaxi',
        apiHost: 'http://192.168.1.107:6868', // taxigo.vn:9697
        mediaHost: 'http://vsoft.vn:1235'
    });


/**
 * @namespace UI
 */
angular.module('ui.vsoft', ['ui.vsoft.tooltip']);//


angular.module('core.vsoft', [
    'core.vsoft.restful',
    'core.vsoft.logger',
    'core.vsoft.BaseModel',
    'core.vsoft.fetchData',
    'core.vsoft.auth',
    'core.vsoft.socketIo',
    'core.vsoft.selectOnClick',
    'core.vsoft.resizeWidth'
]);

/*
 * UI Module
 * */


angular.module('ui.vsoft.tooltip', [])

    .constant('tooltipConfig', {
        timeout: 3000
    })

    .factory('$tooltip', ['$q', '$timeout', '$rootScope', 'tooltipConfig', function ($q, $timeout, $rootScope, tooltipConfig) {

        /**
         * @module frameworkVsoft $tooltip
         * @description create tooltip like android tooltip
         */

        var $tooltip = {
            content: '',
            element: null,

            /**
             * @toc UI.$tooltip.open
             * @function open
             * @param {String} content Nội dung tooltip
             * @param {Number} timeout Thời gian tắt tooltip
             */
            open: function (content, timeout) {
                var me = this;
                me.element = angular.element(document.querySelector('#toolTip'));
                me.close();

                tooltipConfig.timeout = (timeout) ? timeout : tooltipConfig.timeout;
                me.element.addClass('on');
                me.content = content;

                $timeout(function () {
                    me.element.removeClass('on');
                }, tooltipConfig.timeout);
            },
            close: function () {
                this.element.removeClass('on');
            }};
        return $tooltip;
    }]);


/*
 * Core Module
 * */


angular.module('core.vsoft.selectOnClick', [])

    .directive('selectOnClick', function () {

        // Linker function
        return function (scope, element, attrs) {
            element.bind('click', function () {
                this.select();
            });
        };

    });


angular.module('core.vsoft.resizeWidth', [])

    .directive('resizeWidth', function ($window, $rootScope) {
        return function (scope, element) {

            scope.getWinWidth = function () {
                return $window.innerWidth;
            };

            var setNavHeight = function (newPosition) {
                element.css('marginLeft', newPosition + 'px');
            };

            // Set on load
            var test = function (newValue, oldValue) {
                var newPosition = (scope.getWinWidth() / 2) - (element[0].clientWidth / 2);
                setNavHeight(newPosition);
            };

            test();
        };
    });

angular.module('core.vsoft.logger', [])
    .constant('loggerConfig', {
        disableLog: {
            info: true,
            error: false,
            debug: false
        }
    })
    .factory('$logger', ['loggerConfig', function (loggerConfig) {
        /**
         * logger Factory
         *
         * @param {String} moduleName name of the module which will be logged
         * @param {boolean} disableLoginfo disable the info log or not
         * @param {boolean} disableLogerror disable the error log or not
         */

        var _stringify = function (args) {
            var msg = '';

            for (var i = 0; i < args.length; i++) {
                var item = args[i];

                if (angular.isString(item)) {
                    msg += item;
                } else {
                    msg += JSON.stringify(item, null, '\t') + ' ';
                }
            }

            return msg;
        };

        var _getDateTimeStr = function () {
            var date = new Date();
            var dateStr = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
            var timeStr = date.toLocaleTimeString();
            var result = dateStr + ' ' + timeStr;

            return result;
        };

        var _log = function (logLevel, args) {
            if (loggerConfig.disableLog[logLevel]) {
                return false;
            }

            var separator = ' - ';
            var separatorParam = ': ';

            var moduleName = this.moduleName;
            var functionName = args[0];
            var paramDisplay = args[1];

            args.splice(0, 1); //delete first element;
            args.splice(0, 1); //delete second element;

            var content = _stringify(args);
            var msg = _getDateTimeStr() + separator + moduleName + separator + functionName + separator + paramDisplay + separatorParam + content;

            console[this.functionName[logLevel]](msg);
        };

        return {
            moduleName: 'NO MODULE',


            functionName: {info: 'info', error: 'error', debug: 'debug'},

            /**
             * log the messages into Info logging
             *
             * @param {String} functionName name of the function need to log
             * @param {String} displayParam the param need to display
             * @param {Array} theValues the values that need to display
             */
            info: function () {
                var args = Array.prototype.slice.call(arguments, 0);

                angular.bind(this, _log, 'info', args)();
            },

            /**
             * log the messages into Error logging
             *
             * @param {String} functionName name of the function need to log
             * @param {String} displayParam the param need to display
             * @param {Array} theValues the values that need to display
             */
            error: function () {
                var args = Array.prototype.slice.call(arguments, 0);
                angular.bind(this, _log, 'error', args)();
            },

            /**
             * log the messages into Error logging
             *
             * @param {String} functionName name of the function need to log
             * @param {String} displayParam the param need to display
             * @param {Array} theValues the values that need to display
             */
            debug: function () {
                var args = Array.prototype.slice.call(arguments, 0);
                angular.bind(this, _log, 'debug', args)();
            }
        };
    }]);

angular.module('core.vsoft.restful', ['core.vsoft.logger'])
    .service('$restful', ['$resource', 'appConfig', '$logger', function $restful($resource, appConfig, $logger) {

        $logger.moduleName = 'core.vsoft.restful - Restful Service';

        return $resource(appConfig.apiHost + '/:api/:table/:id', {
            api: 'api',
            id: '@id',
            table: '@table'
        }, {
            'get': {method: 'GET'},
            'save': {method: 'POST', params: {}},
            'put': {method: 'PUT', params: {}},
            'query': {method: 'GET', isArray: true},
            'delete': {method: 'DELETE', params: {}}
        });
    }]);


angular.module('core.vsoft.BaseModel', ['core.vsoft.logger', 'core.vsoft.restful'])
    .factory('$baseModel', ['$resource', '$http', '$cookieStore', '$rootScope', '$logger', '$window', '$restful', function ($resource, $http, $cookieStore, $rootScope, $logger, $window, $restful) {
        $logger.moduleName = 'BaseModel Factory';

        var BaseModel = function (tableName, data) {
            this.omitFields = ['omitFields', 'tableName', 'busy', 'cid', 'acceptSocket'];
            this.tableName = tableName;
            this.busy = false;
            this.acceptSocket = false;
            //this.cid = window.uuid.v4();

            var me = this;
            angular.extend(me, data);
        };

        BaseModel.prototype.fetch = function () {
            var me = this;

            if (me.busy) {
                return;
            }
            me.busy = true;

            $restful.get({table: me.tableName, id: me.id}, function (resp) {
                me.busy = false;

                if (resp.success) {
                    if (angular.isObject(window.data)) {
                        angular.extend(me, window.data);

                        if (me._id) {
                            me.id = me._id;
                        }
                    } else {

                    }
                } else {
                    //var errMsg = resp.message;
                    //todo: send or broadcast errMsg to somewhere
                }

                $logger.debug('fetch', 'resp', resp);
            });
        };

        BaseModel.prototype.save = function (callback) {
            $logger.info('save model', 'start', true);

            var me = this;
            var _isNew = false;

            if (me.busy) {
                return;
            }
            me.busy = true;

            if (me.id) {
                _isNew = false;
            } else {
                _isNew = true;
            }

            var saveData = window._.omit(me, me.omitFields);

            if (_isNew) {
                $logger.info('$restful save', 'start', true);
                $restful.save({table: me.tableName}, saveData, function (resp) {
                    me.busy = false;

                    if (resp.success) {
                        me._id = resp.data._id;
                        me.id = me._id;
                        if (me.acceptSocket) {
                            if (me.tableName === 'comments') {
                                window.socketIo.emit('socket', {table: me.tableName, action: 'create', id: resp.data._id, postID: resp.data.post.id});
                            }
                            else {
                                window.socketIo.emit('socket', {table: me.tableName, action: 'create', id: resp.data._id});
                            }
                        }
                    } else {
                        //var errMsg = resp.message;
                        //TODO: send or broadcast errMsg to somewhere

                    }

                    $logger.info('create new model', 'resp', resp);

                    if (callback) {
                        callback(resp.success ? null : resp.message, resp.data);
                    }
                });
            } else {
                $logger.info('$restful put', 'start', true);
                $restful.put({table: me.tableName, id: me.id}, saveData, function (resp) {
                    me.busy = false;

                    if (resp.success) {
                        if (me.acceptSocket) {
                            window.socketIo.emit('socket', {table: me.tableName, action: 'update', id: resp.data.id});
                        }
                        //TODO:
                    } else {
                        //var errMsg = resp.message;
                        //TODO: send or broadcast errMsg to somewhere
                    }

                    $logger.info('update existing model', 'resp', resp);

                    if (callback) {
                        callback(resp.success ? null : resp.message, resp.data);
                    }
                });
            }
        };

        BaseModel.prototype.destroy = function (callback) {
            var me = this;

            if (me.busy) {
                return;
            }
            me.busy = true;

            $restful.delete({table: me.tableName, id: me.id}, function (resp) {
                me.busy = false;

                if (resp.success) {

                    if (me.acceptSocket) {
                        window.socketIo.emit('socket', {table: me.tableName, action: 'create'});
                        //window.socketIo.emit("comment", {table: "comment", action: 'create'})
                        //window.socketIo.emit("comment/10", {emit: "comments/10", table: "comment", action: 'create'})
                    }

                    if (callback) {
                        callback(null, resp.data);
                    }
                } else {
                    //var errMsg = resp.message;
                    //TODO: send or broadcast errMsg to somewhere
                    if (callback) {
                        callback(resp.message, null);
                    }
                }

                $logger.info('delete model', 'resp', resp);
            });
        };


        return BaseModel;
    }]);

angular.module('core.vsoft.fetchData', ['core.vsoft.logger', 'core.vsoft.restful', 'core.vsoft.BaseModel', 'ngCollection'])
    .factory('$fetchData', ['$baseModel', '$restful', '$q', '$collection', '$logger', function ($baseModel, $restful, $q, $collection, $logger) {

        $logger.moduleName = 'Fetch Data Factory';


        var fetchData;

        fetchData = {
            getData: function (tableName, start, limit, filters, sorters) {

                var _start, _limit, _filters, _sorters;

                var defer = $q.defer();
                var collection = $collection;
                var dataCollection = collection.getInstance();


                _start = start || 0;
                _limit = limit || 1000;
                _filters = JSON.stringify(filters) || null;
                _sorters = JSON.stringify(sorters) || null;


                $restful.get({table: tableName, start: _start, limit: _limit, filter: _filters, sort: _sorters}, function (resp) {
                    if (resp.success) {
                        var items = resp.data;
                        angular.forEach(items, function (item) {
                            var dataModel = new $baseModel(tableName, item);
                            dataCollection.add(dataModel);
                        });
                        dataCollection.total = resp.total;
                        defer.resolve(dataCollection);

                    } else {
                        defer.reject(resp.message);
                    }
                }, function (err) {
                    defer.reject(err);
                });

                return defer.promise;
            }
        };
        return fetchData;
    }]);


angular.module('core.vsoft.auth', ['core.vsoft.logger', 'core.vsoft.restful', 'LocalStorageModule', 'core.vsoft.fetchData'])

    .factory('$auth', ['$resource', '$http', '$cookieStore', '$rootScope', 'localStorageService', '$logger', '$q', 'appConfig', '$fetchData', '$restful',
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
                    $cookieStore.remove(_userKey);

                    //localStorageService.set(_userKey, null);
                },

                /*
                 setUser: function (user) {
                 this.user = user;
                 },
                 */

                setUser: function (user) {

                    $cookieStore.put(_userKey, JSON.stringify(user));

                    //sessionStorage[_userKey] = JSON.stringify(user);
                    //localStorageService.set(_userKey, user);
                },

                /*
                 getUser: function () {
                 return this.user || null;

                 },
                 */

                getUser: function () {
                    var cachedUser = $cookieStore.get(_userKey);

                    //var cachedUser = localStorageService.get(_userKey);

                    if (!!cachedUser) {
                        return JSON.parse(cachedUser);
                    }

                    return null;

                },
                setToken: function (token) {
                    if (token) {
                        _setHeaderToken(token);
                        $cookieStore.put(_tokenKey, token);
                    } else {
                        _setHeaderToken(null);
                        $cookieStore.put(_tokenKey, null);
                    }

                    //sessionStorage[_tokenKey] = token;
                    //localStorageService.set(_tokenKey, token);
                },

                getToken: function () {
                    return $cookieStore.get(_tokenKey);
                },

                clearToken: function () {
                    _clearHeaderToken();
                    $cookieStore.put(_tokenKey, null);
                    //localStorageService.set(_tokenKey, null);
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

                        callBack(true);
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
                        username: data.username,
                        password: data.password,
                        userId: me.getAppRegisterInfo().id,
                        deviceId: appConfig.deviceId,
                        fullname: data.fullname,
                        phone: data.username
                        /*birthday: data.birthday,*/
                        /*location: data.location*/
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
                getUserInfoById: function (id, cb) {

                    $restful.get({table: 'Users', id: id}, function (resp) {
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
                            'url': appConfig.apiHost + '/login'
                        })
                        .success(function (data) { //.success(function(data, status, headers, config)
                            $logger.info('login', 'success', true);

                            var user = data.user;
                            var token = data.token;

                            me.setAppRegister(user);
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
                    $cookieStore.put(_lastLoginNameKey, this.getUserName());
                },

                getLastLoginName: function () {
                    return $cookieStore.get(_lastLoginNameKey);
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


angular.module('core.vsoft.socketIo', [])
    .factory('$socketIo', function ($rootScope) {
        var socket = window.socketIo;
        return {
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            }
        };
    });