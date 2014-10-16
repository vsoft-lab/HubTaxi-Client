'use strict';

angular.module('itaxiApp')
    .factory('taxi', ['$baseModel', '$restful', '$q', '$collection', '$logger', 'localStorageService',
        function ($baseModel, $restful, $q, $collection, $logger, localStorageService) {

            $logger.moduleName = 'Taxi Factory';

            var _directionInfo = 'directionInfo';
            var _currentStatus = 'currentStatus';
            var taxi = {
                listCurrentTaxi: {},
                createRoutes: function (taxiId, customerId, routerInfo, cb) {
                    var saveData = {
                        customer: customerId,
                        driver: taxiId,
                        startPoint: routerInfo.startPoint,
                        endPoint: routerInfo.endPoint,
                        duration: routerInfo.duration,
                        distance: routerInfo.distance,

                        endAt: new Date(),
                        amount: routerInfo.amount,
                        status: 0,
                        roomID: taxi.getCurrentRoomID()
                    };

                    $logger.info('createRoutes', 'saveData', saveData);

                    $restful.save({table: 'RouteHistories'}, saveData, function (resp) {
                        if (resp.success) {
                            cb(null, resp);
                        } else {
                            cb(resp.message, null);
                        }
                    }, function (error) {
                        cb(error, null);
                    });
                },
                checkRoute: function (cb) {
                    var me = this,
                        currentStatus = me.getCurrentStatus(),
                        currentRoute = me.getDirectionInfo();

                    if (currentStatus !== 0 && !!currentRoute) {

                        $restful.get({table: 'RouteHistories', id: currentRoute[0].id}, function (resp) {

                            if (resp.success) {

                                /*switch (resp.data[0].status) {
                                 case 0:
                                 $logger.info('checkRoutes', 'status', 0, 'Handshaking with taxi');
                                 // Taxi and customer handshake , and Taxi going to position of customer
                                 break;
                                 case 1:
                                 // Taxi and customer runing
                                 break;
                                 case 2:
                                 $logger.info('checkRoutes', 'status', 1, 'Routes done ! without problem');
                                 me.setCurrentStatus(0);
                                 me.setDirectionInfo(null);
                                 // Routes done ! without problem
                                 break;
                                 case 3:
                                 // Route has been destroy by Customer
                                 break;
                                 case 4:
                                 // Route has been destroy by Driver
                                 break;
                                 }*/

                                cb(null, resp.data[0]);
                            } else {
                                cb(resp.message, null);
                                $logger.info('checkRoute()', 'err', resp.message);
                            }
                        })
                    }

                },
                updateRoute: function (routeId, data, cb) {
                    /*
                     * List status :
                     * 0 : Taxi and customer handshaking ..
                     *  1 : Taxi and customer runing...
                     *  2 : Route done ! without error
                     *  3 : Route has been destroy by Customer
                     *  4 : Route has been destroy by Drivers
                     * */


                    $restful.put({table: 'RouteHistories', id: routeId}, data, function (resp) {
                        $logger.info('updateRoute', 'resp', resp);
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
                    /*
                     * List Status :
                     * 0 : Normal
                     * 1 : Busy (hanshaking with taxi or runing)
                     * 2 : Die (disconect or ....)
                     * */

                    return (localStorageService.get(_currentStatus)) ? localStorageService.get(_currentStatus) : 0;
                },
                setCurrentRoomID: function (roomID) {
                    localStorageService.add('roomID', roomID);
                },
                getCurrentRoomID: function () {
                    return (localStorageService.get('roomID')) ? localStorageService.get('roomID') : 0;
                }
            };

            return taxi;
        }])
;
