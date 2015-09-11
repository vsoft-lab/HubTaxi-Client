'use strict';

angular.module('taxigoDriverApp')
    .factory('gmaps', ['$rootScope', '$timeout', 'auth', 'config', 'driver', 'logger', '$interval',
        function ($rootScope, $timeout, auth, config, driver, logger, $interval) {

            var gMaps = {
                LatLng: null,
                lat: null,
                lng: null,
                accuracy: null,
                map: null,
                directionsDisplay: null,
                currentPoint: null,
                directionsService: null,
                searchDirection: null,
                currentPointInput: null,
                currentPointInputLocation: null,
                geocoder: null,
                startPointMarker: null,
                endPointMarker: null,
                RoutePolyline: null,
                listMarkerCustomer: [],
                setLatLng: function (position) {
                    this.LatLng = new L.LatLng(position.coords.latitude, position.coords.longitude);
                    this.setLat(position);
                    this.setLng(position);
                },
                mapOptions: function () {
                    return {
                        zoom: 17,
                        center: this.LatLng
                    };
                },
                init: function () {

                    /*gMaps.map = new google.maps.Map(document.getElementById('map'), {
                     zoom: 17,
                     center: new L.LatLng(21.029771, 105.801811)
                     });*/

                    gMaps.map = L.map('map').setView([21.029771, 105.801811], 17);

                    L.tileLayer('http://{s}.tiles.mapbox.com/v4/thinhnvv.cieef6v3v025rs9lx3852m36x/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidGhpbmhudnYiLCJhIjoiZjQzYWM1ZDQ4YjNkNjc5YzQwZjA5OWIwNTNhZDNhODMifQ.53wH0q9UO48XrvK_TUESmg',
                        { maxZoom: 18  }).addTo(gMaps.map);
                    /*
                     L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                     { maxZoom: 18  }).addTo(gMaps.map);
                     */

                    gMaps.startPointMarker = L.marker();
                    gMaps.endPointMarker = L.marker();

                    navigator.geolocation.getCurrentPosition(gMaps.getPositionSuccess, gMaps.getPositionError);

                    logger.info('gMaps Init', 'start', true);
                },

                getPositionSuccess: function (position) {

                    logger.info('gMaps Service', 'getPositionSuccess', 'start', true);

                    gMaps.setLatLng(position);

                    gMaps.map.panTo(new L.LatLng(position.coords.latitude, position.coords.longitude));


                    /*
                     * Register Service
                     * */


                    gMaps.geocoder = new google.maps.Geocoder();
                    gMaps.directionsDisplay = new google.maps.DirectionsRenderer({
                        draggable: true
                    });

                    //gMaps.directionsDisplay.setMap(gMaps.map);
                    //gMaps.geocoder = new google.maps.Geocoder();



                    gMaps.setCurrentPoint(new L.LatLng(position.coords.latitude, position.coords.longitude));


                    if (driver.getCurrentStatus() == 1) {
                        var currentRoute = driver.getDirectionInfo();

                        window.socketIo.emit('reconnect:route', {
                            roomID: driver.getCurrentRoomID(),
                            carLic: driver.getDirectionInfo()[0].driver.username
                        });
                        if (currentRoute[0].startPoint !== currentRoute[0].endPoint) {
                            gMaps.getDirectionByGeoCode(currentRoute[0].startPoint, currentRoute[0].endPoint);
                        }
                    }


                    // Watch current position and display on maps
                    console.log(' auth.getUser() :', auth.getUser());
                    if ($rootScope.isLogin) {

                        $interval(function () {

                            navigator.geolocation.getCurrentPosition(function (position) {
                                var sendLocation = {
                                    taxiId: auth.getUserId(),
                                    deviceId: config.deviceId,
                                    lat: position.coords.latitude,
                                    lng: position.coords.longitude,
                                    LatLng: new L.LatLng(position.coords.latitude, position.coords.longitude),
                                    driver: true,
                                    carLic: auth.getUserName(),
                                    taxi: 'HubTaxi',
                                    hotline: '073 211 211',
                                    seatNum: 4,
                                    status: driver.getCurrentStatus()
                                };

                                window.socketIo.emit('taxi:send:location', sendLocation); // Send current location to server
                                gMaps.setCurrentPoint(new L.LatLng(position.coords.latitude, position.coords.longitude));

                            }, function () {
                                logger.info('$interval-getPosition', 'success', false);
                            });

                        }, 1000);
                    }
                },
                watchPositionSuccess: function (position) {
                    /*var newLatLng = new L.LatLng(position.coords.latitude, position.coords.longitude);
                     gMaps.currentPoint.setPosition(newLatLng);
                     gMaps.map.setCenter(newLatLng);*/
                },
                setLat: function (position) {
                    this.lat = position.coords.latitude;
                },
                setLng: function (position) {
                    this.lng = position.coords.longitude;
                },
                getPositionError: function (error) {
                    console.log('Map load false', error);
                },
                setCurrentPoint: function (position) {
                    var me = this;

                    if (me.currentPoint) {
                        me.currentPoint.setLatLng(position);
                    } else {
                        me.currentPoint = L.marker(position).addTo(me.map).bindPopup("<b>Hello world!</b><br />I am a popup.");
                    }


                    me.currentPoint.on('click', function () { // Bắt sự kiện của người dùng trên bản đồ
                        me.map.panTo(me.currentPoint.getLatLng());
                    });

                    /*me.currentPoint = new google.maps.Marker({ // Tạo một point trên bản đồ
                     position: me.map.getCenter(),
                     map: me.map,
                     title: 'Vị trí của bạn',
                     icon: 'images/icon.png',
                     animation: google.maps.Animation.DROP
                     });

                     google.maps.event.addListener(me.currentPoint, 'click', function () { // Bắt sự kiện của người dùng trên bản đồ
                     var infoWindow = new google.maps.InfoWindow({
                     content: 'Vị trí tương đối của bạn'
                     });
                     me.map.setCenter(me.currentPoint.getPosition());

                     infoWindow.open(me.currentPoint.get('map'), me.currentPoint);
                     $timeout(function () {
                     infoWindow.close();
                     }, 5000)
                     });*/
                },

                sendMessage: function () {
                    var deviceId = null;
                    if (window.device) {
                        deviceId = window.device.uuid;
                    }
                    var sendLocation = {
                        deviceId: config.deviceId
                        //TODO: Ghi thêm các phương thức ở đây
                    };
                    console.log('Socket.io');

                },

                getDirectionByClick: function () {
                    var me = this;
                    google.maps.event.addListener(me.map, 'click', function (evt) { // Listen Evt click on Maps
                        me.directionsService = new google.maps.DirectionsService();

                        if (window.confirm('Bạn muốn chọn địa điểm này ?')) {

                            var request = {
                                origin: me.currentPointInputLocation, //me.LatLng, // Start Position
                                destination: evt.latLng, // END Position
                                travelMode: google.maps.TravelMode.DRIVING, // Phương tiện : đi bộ , oto , xe bus....
                                unitSystem: google.maps.UnitSystem.METRIC
                            };

                            me.directionsService.route(request, function (result, status) {

                                if (status == google.maps.DirectionsStatus.OK) {
                                    me.directionsDisplay.setDirections(result);
                                    var routes = result.routes[0];
                                }

                            });

                        }
                    });
                },
                direcCenter: function () {
                    var me = this;
                    me.map.panTo(me.currentPoint.getLatLng());
                },
                getDirectionByGeoCode: function (start, end, cb) {
                    var me = this;
                    me.geocoder.geocode({address: end}, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            me.directionsService = new google.maps.DirectionsService();
                            //me.map.setCenter(results[0].geometry.location);

                            /*var marker = new google.maps.Marker({
                             map: map,
                             position: results[0].geometry.location
                             });*/

                            var request = {
                                origin: start, // Start Position
                                destination: results[0].geometry.location, // END Position
                                travelMode: google.maps.TravelMode.DRIVING, // Phương tiện : đi bộ , oto , xe bus....
                                unitSystem: google.maps.UnitSystem.METRIC
                            };

                            me.directionsService.route(request, function (result, status) {

                                if (status == google.maps.DirectionsStatus.OK) {

                                    //me.directionsDisplay.setDirections(result);
                                    var routes = result.routes[0]; // Contain all property about direction read more : https://developers.google.com/maps/documentation/javascript/referenceDirectionsResult


                                    var point, route, points = [];

                                    var decodePath = google.maps.geometry.encoding.decodePath(result.routes[0].overview_polyline.points);

                                    for (var i = 0; i < decodePath.length; i++) {
                                        if (decodePath[i]) {
                                            point = new L.LatLng(decodePath[i].lat(), decodePath[i].lng());
                                            points.push(point);

                                            if (i == 0) { // Create new marker at Start Point

                                                gMaps.startPointMarker = L.marker(new L.LatLng(decodePath[i].lat(), decodePath[i].lng()), {
                                                    riseOnHover: true,
                                                    alt: 'Điểm đi',
                                                    icon: L.icon({
                                                        iconUrl: './images/pin_blue.png',
                                                        iconSize: [48, 48],
                                                        popupAnchor: [0, -20]
                                                    })
                                                }).addTo(me.map).bindPopup('Điểm đi :' + routes.legs[0].start_address);

                                                gMaps.map.panTo(new L.LatLng(decodePath[i].lat(), decodePath[i].lng()));
                                            }

                                            if (i == decodePath.length - 1) { // Create new marker at end point
                                                gMaps.endPointMarker = L.marker(new L.LatLng(decodePath[i].lat(), decodePath[i].lng()), {
                                                    riseOnHover: true,
                                                    alt: 'Điểm đi',
                                                    icon: L.icon({
                                                        iconUrl: './images/pinIconPink.png',
                                                        iconSize: [48, 48],
                                                        popupAnchor: [0, -20]
                                                    })
                                                }).addTo(me.map).bindPopup('Điểm đến :' + routes.legs[0].end_address);
                                            }
                                        }
                                    }

                                    if (me.RoutePolyline) {
                                        me.map.removeLayer(me.RoutePolyline);
                                        logger.info('getDirectionByGeoCode', 'Map Remove Layer', true);
                                    }

                                    me.RoutePolyline = new L.Polyline(points, {
                                        weight: 5,
                                        opacity: 0.5,
                                        smoothFactor: 1
                                    }).addTo(gMaps.map);

                                    me.RoutePolyline.bringToFront();

                                    (cb && angular.isFunction(cb)) ? cb(null, routes) : null;

                                }

                            });

                        } else {
                            (cb && angular.isFunction(cb)) ? cb(status, null) : null;

                            alert('Geocode was not successful for the following reason: ' + status);
                        }
                    })
                },
                getInfoBox: function (marker) {
                    var me = this;
                    google.maps.event.addListener(marker, 'click', function () { // Bắt sự kiện của người dùng trên bản đồ
                        var info = new google.maps.InfoWindow({
                            content: marker.get('content')
                        });
                        info.open(marker.get('map'), marker);
                    });
                },
                createMarker: function (listPoint) {
                    var me = this;

                    me.listMarkerCustomer = [];

                    var position = new L.LatLng(listPoint.lat, listPoint.lng);

                    var newMarker = L.marker(position, {
                        riseOnHover: true,
                        alt: 'myName',
                        icon: L.icon({
                            iconUrl: '../../images/people.png',
                            iconSize: [24, 24]
                        })
                    }).addTo(me.map).bindPopup("<b>" + 'Khách hàng' + "</b><br />I am a popup.");

                    me.listMarkerCustomer.push(newMarker);


                }
            };
            return gMaps;

        }])
;

