'use strict';

angular.module('taxigoDriverApp')
    .factory('driver', ['BaseModel', 'restful', '$q', 'logger', 'localStorageService',
        function (BaseModel, restful, $q, logger, localStorageService) {

            logger.moduleName = 'Driver Factory';

            var _directionInfo = 'directionInfo';
            var _currentStatus = 'currentStatus';
            var driver = {
                getDirection: function (routeId, cb) {
                    restful.get({table: 'RouteHistories', id: routeId}, function (resp) {
                        if (resp.success) {
                            logger.info('getDirection()', 'success', true);
                            cb(null, resp.data);
                        } else {
                            logger.info('getDirection()', 'err', resp.message);
                            cb(resp.message, null);
                        }
                    })
                },
                checkRoute: function (cb) {
                    var me = this,
                        currentStatus = me.getCurrentStatus(),
                        currentRoute = me.getDirectionInfo();

                    //logger.info('checkRoute', 'currentRoute', currentRoute);

                    if (currentStatus !== 0 && !!currentRoute) {
                        restful.get({table: 'RouteHistories', id: currentRoute[0].id}, function (resp) {

                            //logger.info('checkRoute', 'resp', resp);
                            if (resp.success) {

                                cb(null, resp.data[0]);
                            } else {
                                cb(resp.message, null);
                            }
                        })
                    }
                },
                updateRoute: function (routeId, status, cb) {
                    /*
                     * List status :
                     *  0 : Taxi and customer handshaking ..
                     *  1 : Taxi and customer runing...
                     *  2 : Route done ! without error
                     *  3 : Route has been destroy by Customer
                     *  4 : Route has been destroy by Drivers
                     * */

                    if (status == 0 || status == 1) {
                        driver.setRouteStatus(status);
                    } else {
                        driver.setRouteStatus(null);
                    }
                    var data = {
                        status: status,
                        endAt: new Date()
                    };
                    ///console.log('routerID', routeId);


                    restful.put({table: 'RouteHistories', id: routeId}, data, function (resp) {
                        logger.info('updateRoute', 'resp', resp);
                        if (resp.success) {
                            (cb) ? cb(null, resp.data[0]) : null;
                        } else {
                            (cb) ? cb(resp.message, null) : null;
                        }
                    })
                },

                setDirectionInfo: function (direction) {
                    localStorageService.add(_directionInfo, direction);
                },
                getDirectionInfo: function () {
                    return (localStorageService.get(_directionInfo)) ? localStorageService.get(_directionInfo) : false;
                },
                setCurrentStatus: function (status) {
                    localStorageService.add(_currentStatus, status);
                },
                getCurrentStatus: function () {
                    return (localStorageService.get(_currentStatus)) ? localStorageService.get(_currentStatus) : 0;
                },
                setCurrentRoomID: function (roomID) {
                    localStorageService.add('roomID', roomID);
                },
                getCurrentRoomID: function () {
                    return (localStorageService.get('roomID')) ? localStorageService.get('roomID') : 0;
                },
                setRouteStatus: function (value) {
                    localStorageService.add('RouteStatus', value);
                },
                getRouteStatus: function () {
                    return (localStorageService.get('RouteStatus')) ? localStorageService.get('RouteStatus') : 0;
                }
            };

            return driver;
        }])
;
