'use strict';

angular.module('itaxiApp')
    .factory('routes', ['$rootScope', '$timeout', '$restful', '$logger', 'gmaps', 'taxi', '$auth', 'appConfig', '$fetchData',
        function ($rootScope, $timeout, $restful, $logger, gmaps, taxi, $auth, appConfig, $fetchData) {

            $logger.moduleName = 'Routes Factory';
            var routerInfo;
            var routes = {
                chooseTaxi: function (taxiData, isQuick, cb) {

                    var taxiID = taxiData.id;
                    var customerId = $auth.getUserId() || $auth.getAppRegisterInfo().id;


                    if (_.size(gmaps.directionInfo) > 0) {
                        routerInfo = {
                            startPoint: gmaps.directionInfo.legs[0].start_address,
                            endPoint: gmaps.directionInfo.legs[0].end_address,
                            duration: gmaps.directionInfo.legs[0].duration.value,
                            distance: gmaps.directionInfo.legs[0].distance.value,
                            amount: (gmaps.directionInfo.legs[0].distance.value / 1000) * 12000
                        };

                    } else {
                        routerInfo = {
                            startPoint: $rootScope.originInput,
                            endPoint: $rootScope.originInput
                        };

                    }


                    taxi.createRoutes(taxiID, customerId, routerInfo, function (err, result) {

                        if (err) {
                            cb(err, null);
                            $logger.info('chooseTaxi', 'err', err);
                        } else {

                            $logger.info('chooseTaxi', 'result', result);

                            $rootScope.idTaxi = result.data[0].driver.id;
                            taxi.setDirectionInfo(result.data);

                            if (isQuick) {
                                /*gmaps.getDirectionByGeoCode(result.data[0].startPoint, result.data[0].endPoint, function (err, result) {
                                 $logger.info('quick-call', 'getDirection', 'success', true);
                                 });*/

                            }

                            taxi.setCurrentStatus(1);
                            if (gmaps.listMarkerTaxi.length) {

                                angular.forEach(gmaps.listMarkerTaxi, function (v, k) {
                                    if (v.options.carLic !== taxiData.username) {
                                        console.log('Remove taxi');
                                        gmaps.map.removeLayer(v);
                                    }
                                });
                            }
                            /*if (gmaps.markerCluster) {
                                gmaps.markerCluster.clearMarkers();
                            }*/

                            if (taxi.listCurrentTaxi.hasOwnProperty(taxiID)) {
                                gmaps.map.panTo(new google.maps.LatLng(taxi.listCurrentTaxi[taxiID].lat, taxi.listCurrentTaxi[taxiID].lat));
                            }

                            //gmaps.currentPoint.setMap(null);

                            var chooseTaxiData = {
                                carLic: taxiData.username,
                                roomID: taxi.getCurrentRoomID(),
                                customerId: customerId,
                                customerDeviceId: appConfig.deviceId,
                                routeId: result.data[0].id,
                                isQuick: isQuick || false
                            };

                            socketIo.emit('choose:taxi', chooseTaxiData);
                            cb(null, result);
                        }
                    });
                },
                getLastRoute: function (customerId, cb) {
                    var filter = [
                        {
                            property: 'customer',
                            value: customerId,
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
                    $restful.get({table: 'RouteHistories', start: 0, limit: 1, filter: JSON.stringify(filter), sort: JSON.stringify(sorter)}, function (resp) {
                        if (resp.success) {
                            cb(null, resp.data);
                        } else {
                            cb(resp.message, null);
                        }

                    });

                }
            };


            return routes;
        }])
;