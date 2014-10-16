'use strict';

angular.module('taxigoDriverApp')
    .factory('routes', ['$rootScope', '$timeout', 'restful', 'driver', 'logger', function ($rootScope, $timeout, restful, driver, logger) {

        var routes = {
            checkRouteStatus: function (cb) {

            },
            checkLastRoute: function (driverId, cb) {
                var filter = [
                    {
                        property: 'driver',
                        value: driverId,
                        type: 'string',
                        comparison: 'eq'
                    }
                ];

                var sorter = [
                    {
                        property: 'startAt',
                        direction: 'DESC'
                    }
                ];

                restful.get({table: 'RouteHistories', start: 0, limit: 1, filter: JSON.stringify(filter), sort: JSON.stringify(sorter)}, function (resp) {
                    console.log('getResp', resp);
                    if (resp.success) {

                        if (resp.data.length > 0) {
                            switch (resp.data[0].status) {
                                case 0:
                                    logger.info('checkRoutes', 'status', 0, 'Handshaking with taxi');
                                    driver.setCurrentRoomID(resp.data[0].roomID);
                                    driver.setCurrentStatus(1);

                                    driver.setDirectionInfo(resp.data);
                                    // TODO: Taxi and customer handshake , and Taxi going to position of customer or Taxi and customer running
                                    break;
                                case 1:
                                    logger.info('checkRoutes', 'status', 1, 'Taxi and customer runing..');
                                    //TODO : Taxi and customer running ....
                                    driver.setCurrentRoomID(resp.data[0].roomID);
                                    driver.setCurrentStatus(1);
                                    driver.setDirectionInfo(resp.data);

                                    break;
                                case 2:

                                    driver.setCurrentStatus(0);
                                    driver.setDirectionInfo(null);
                                    logger.info('checkRoutes', 'status', 2, 'Routes done ! without problem');

                                    break;
                                case 3:
                                    driver.setCurrentStatus(0);
                                    driver.setDirectionInfo(null);
                                    break;
                                case 4:
                                    driver.setCurrentStatus(0);
                                    driver.setDirectionInfo(null);
                                    break;
                            }

                            if (resp.data[0].status == 0 || resp.data[0].status == 1) {
                                driver.setRouteStatus(resp.data[0].status);
                            } else {
                                driver.setRouteStatus(null);
                            }
                        } else {
                            driver.setCurrentStatus(0);
                            driver.setDirectionInfo(null);
                            console.log('---------- llll')
                        }
                        /*console.log('resp', resp);*/
                        cb(null, resp.data)
                    } else {
                        console.log('resp', resp);
                        cb(resp.message, null);
                    }

                });

            }
        };
        return routes;
    }]);