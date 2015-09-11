'use strict';
'use strict';

angular.module('itaxiApp')
    .factory('gmaps', ['$rootScope', '$timeout' , '$logger', 'config', 'taxi', '$state', '$window', 'appConfig', '$filter',
        function ($rootScope, $timeout, $logger, config, taxi, $state, $window, appConfig, $filter) {

            $logger.moduleName = 'gMaps Factory';

            var gMaps = {
                lastPosition: null,
                LatLng: null,
                lat: null,
                lng: null,
                accuracy: null,
                map: null,
                RoutePolyline: null,
                currentPoint: null,
                directionsService: null,
                searchDirection: null,
                currentPointInput: null,
                currentPointInputLocation: null,
                directionInfo: {},
                listMarkerTaxi: [],
                geocoder: null,
                infoBox: null,
                circle: null,
                placeService: null,
                startPointMarker: null,
                endPointMarker: null,
                markerCluster: null,
                setLatLng: function (position) {
                    this.LatLng = new L.LatLng(position.coords.latitude, position.coords.longitude);
                    this.setLat(position);
                    this.setLng(position);
                },
                mapOptions: function () {
                    return {
                        zoom: 17,
                        disableDefaultUI: true,
                        styles: [
                            {
                                featureType: "poi", /*poi.business*/
                                elementType: "labels",
                                stylers: [
                                    {
                                        visibility: "off"
                                    }
                                ]
                            }
                        ]
                    };
                },

                init: function () {


                    gMaps.map = L.map('map').setView([21.029771, 105.801811], 15);

                    /*L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                     {    maxZoom: 18  }).addTo(gMaps.map);*/

                    L.tileLayer('http://{s}.tiles.mapbox.com/v4/thinhnvv.cieef6v3v025rs9lx3852m36x/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidGhpbmhudnYiLCJhIjoiZjQzYWM1ZDQ4YjNkNjc5YzQwZjA5OWIwNTNhZDNhODMifQ.53wH0q9UO48XrvK_TUESmg',
                        { maxZoom: 18  }).addTo(gMaps.map); // Link maps layer

                    gMaps.placeService = new google.maps.places.AutocompleteService();


                    /*gMaps.startPointMarker = L.marker().addTo(gMaps.map);
                     gMaps.endPointMarker = L.marker().addTo(gMaps.map);*/

                    var me = this;

                    /*alert('Begin Get Current Position');*/
                    navigator.geolocation.getCurrentPosition(me.getPositionSuccess, me.getPositionError, {
                        enableHighAccuracy: true,
                        maximumAge: 5000
                    });
                },

                iniSearchPoint: function () {

                    var originInput = document.getElementById('originInput');

                    gMaps.geocoder.geocode({'latLng': gMaps.LatLng}, function (results, status) { // Get Address Info From LatLng
                        if (status === 'OK') {
                            $rootScope.$apply(function(){
                                $rootScope.startPoint = results[0].formatted_address;
                            });
                            $logger.info('','$rootScope.startPoint',$rootScope.startPoint );
                            $rootScope.originInput = results[0].formatted_address;
                            if(originInput != null){
                                originInput.value = results[0].formatted_address;
                            }

                            gMaps.currentPointInputLocation = results[0].geometry.location;
                            $logger.info('$rootScope.destinationInput', $rootScope.originInput);
                        }
                    });
                },

                getPositionSuccess2G: function (position) { // TODO :

                    gMaps.lastPosition = position;
                    var genMap = function (latLng) {
                        var mapEl = document.getElementById('map');
                        var mapHeight = mapEl.offsetHeight;
                        var mapWidth = mapEl.offsetWidth;
                        mapEl.innerHTML = "<img src='http://maps.google.com/maps/api/staticmap?center=" + latLng + "&markers=" + latLng + "&zoom=6&size=" + 1000 + "x" + 1000 + "&sensor=false'>";
                    };
                    var ll = [position.coords.latitude, position.coords.longitude].join(',');

                    genMap(ll);

                    angular.element($window).bind('resize', function () {
                        genMap(ll);
                    });

                },

                getPositionSuccess: function (position) {
                    /*alert('getPositionSuccess');*/
                    gMaps.lastPosition = position;

                    $logger.info('getPositionSuccess', 'success', true);

                    gMaps.setLatLng(position);

                    gMaps.map.panTo(new L.LatLng(position.coords.latitude, position.coords.longitude));


                    gMaps.geocoder = new google.maps.Geocoder();

                    /*gMaps.directionsDisplay = new google.maps.DirectionsRenderer({
                     draggable: false,
                     suppressMarkers: true
                     });*/

                    //gMaps.directionsDisplay.setMap(gMaps.map);

                    gMaps.geocoder = new google.maps.Geocoder();
                    gMaps.infoBox = new google.maps.InfoWindow();


                    if ($rootScope.status.hasRouter) {

                    } else {
                        gMaps.iniSearchPoint();
                    }


                    var sendLocation = {
                        deviceId: appConfig.deviceId,
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        LatLng: new L.LatLng(position.coords.latitude, position.coords.longitude),
                        status: taxi.getCurrentStatus()
                    };


                    window.socketIo.emit('send:location', sendLocation); // Send current location to server


                    //TODO : check status route and process

                    if (taxi.getCurrentStatus() == 0) { // Waiting
                        $logger.info('findTaxi', 'start');

                        gMaps.findTaxi(4); // filter : Seat number

                        gMaps.setCurrentPoint(new L.LatLng(position.coords.latitude, position.coords.longitude));
                    } else {
                        var currentRoute = taxi.getDirectionInfo();

                        window.socketIo.emit('reconnect:route', {
                            roomID: taxi.getCurrentRoomID(),
                            carLic: taxi.getDirectionInfo()[0].driver.username
                        });

                        window.socketIo.on('current:route:info', function (taxiInfo) {
                            if (!taxiInfo) {
                                $logger.info('current:route:info', 'taxi not found in server ', true);
                            }

                            var markerInfo = {};
                            markerInfo[taxi.getDirectionInfo()[0].driver.username] = taxiInfo;

                            gMaps.createMarker(markerInfo);
                        });

                        gMaps.setCurrentPoint(gMaps.map.getCenter());

                        if (currentRoute[0].startPoint !== currentRoute[0].endPoint) {
                            gMaps.getDirectionByGeoCode(currentRoute[0].startPoint, currentRoute[0].endPoint);
                        }

                    }


                    setInterval(function () {
                        navigator.geolocation.getCurrentPosition(function (position) {
                            //console.log('getCurrentPosition', true);

                            var sendLocation = {
                                deviceId: appConfig.deviceId,
                                lat: position.coords.latitude,
                                lng: position.coords.longitude,
                                LatLng: {},
                                status: taxi.getCurrentStatus()
                            };

                            window.socketIo.emit('send:location', sendLocation); // Send current location to server
                        }, function () {
                            $logger.info('$interval-getPosition', 'false', true);
                        });
                    }, 500); // send location after 0.5 seconds


                },
                watchPositionSuccess: function (position) {
                    var newLatLng = new L.LatLng(position.coords.latitude, position.coords.longitude);
                    gMaps.currentPoint.setPosition(newLatLng);
                    gMaps.map.panTo(newLatLng);
                },
                setLat: function (position) {
                    this.lat = position.coords.latitude;
                },
                setLng: function (position) {
                    this.lng = position.coords.longitude;
                },

                getPositionError: function (error) {
                    console.log('Load map:', error);
                },

                setCurrentPoint: function (position) {
                    var me = this;

                    if (me.currentPoint) {
                        me.map.removeLayer(me.currentPoint);
                    }

                    me.currentPoint = L.marker(position, {
                        icon: L.icon({
                            iconUrl: './images/me.png',
                            iconSize: [40, 62]
                        })
                    }).addTo(me.map)/*.bindPopup("<b>Vị trí</b><br /> Hiện tại của bạn")*/;

                    me.currentPoint.on('click', function () { // Bắt sự kiện của người dùng trên bản đồ
                        me.map.panTo(me.currentPoint.getLatLng());
                    });

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

                                    /*me.directionsDisplay.setDirections(result);*/

                                    var routes = result.routes[0]; // Contain all property about direction read more : https://developers.google.com/maps/documentation/javascript/referenceDirectionsResult
                                }

                            });

                        }
                    });
                },
                direcCenter: function () {
                    var me = this;

                    me.map.panTo(me.currentPoint.getLatLng());
                },

                getDirectionByGeoCode: function (start, address, cb) {
                    var me = this;
                    $rootScope.defaultSelectedAddress = address;
                    me.geocoder.geocode({address: address}, function (results, status) {

                        if (status == google.maps.GeocoderStatus.OK) {
                            me.directionsService = new google.maps.DirectionsService();
                            //me.map.panTo(results[0].geometry.location);

                            var request = {
                                origin: start, // Start Position
                                destination: results[0].geometry.location, // END Position
                                travelMode: google.maps.TravelMode.DRIVING, // Phương tiện : đi bộ , oto , xe bus....
                                unitSystem: google.maps.UnitSystem.METRIC
                            };

                            me.directionsService.route(request, function (result, status) {

                                if (status == google.maps.DirectionsStatus.OK) {

                                    var routes = result.routes[0]; // Contain all property about direction read more : https://developers.google.com/maps/documentation/javascript/referenceDirectionsResult
                                    me.directionInfo = routes;

                                    $rootScope.bookmarked = false;
                                    $rootScope.infoRouter = 'Ước lượng: ' + routes.legs[0].distance.text + ' - ' + $filter('toCurrency')(Math.round(routes.legs[0].distance.value / 1000) * 12000) + ' VNĐ';

                                    $rootScope.showStatus($rootScope.infoRouter);
                                    var point, route, points = [];

                                    var decodePath = google.maps.geometry.encoding.decodePath(result.routes[0].overview_polyline.points);

                                    for (var i = 0; i < decodePath.length; i++) { // Generate route on map
                                        if (decodePath[i]) {
                                            point = new L.LatLng(decodePath[i].lat(), decodePath[i].lng());
                                            points.push(point);

                                            if (i == 0) { // Create new marker at Start Point
                                                if (gMaps.startPointMarker) {
                                                    gMaps.map.removeLayer(gMaps.startPointMarker);
                                                }

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

                                                if (gMaps.endPointMarker) {
                                                    gMaps.map.removeLayer(gMaps.endPointMarker);
                                                }

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
                                        $logger.info('getDirectionByGeoCode', 'Map Remove Layer', true);
                                    }

                                    me.RoutePolyline = new L.Polyline(points, {
                                        weight: 3,
                                        opacity: 0.5,
                                        smoothFactor: 1
                                    }).addTo(gMaps.map);

                                    me.RoutePolyline.bringToFront();


                                   /* var animatedMarker = L.animatedMarker(me.RoutePolyline.getLatLngs(), {
                                        autoStart: true,
                                        distance: routes.legs[0].distance.value,  // meters
                                        interval: 2000 // milliseconds

                                    });

                                    gMaps.map.addLayer(animatedMarker);*/

                                    $rootScope.$apply(function () {

                                        if (Math.round(routes.legs[0].distance.value / 1000) * 12000 > 0) {

                                            $rootScope.distanceCheck = routes.legs[0].distance.value;
                                            if (!$rootScope.status.hasRouter) {
                                                $rootScope.pageTitleCalu = 'Ước lượng: ' + routes.legs[0].distance.text + ' - ' + $filter('toCurrency')(Math.round(routes.legs[0].distance.value / 1000) * 12000) + ' VNĐ';
                                            }

                                            $rootScope.stepDirection = routes.legs[0].steps;
                                            console.log('$rootScope.pageTitle : ', $rootScope.pageTitle);

                                        } else {
                                            /*  $rootScope.pageTitle = 'Bạn thực hiện gọi Taxi nhanh';*/
                                        }
                                    });

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

                        gMaps.infoBox.close();
                        var option = {
                            content: marker.get('content')
                        };
                        gMaps.infoBox.setOptions(option);

                        gMaps.infoBox.open(marker.get('map'), marker);
                    });
                },
                createMarker: function (listPoint, filter) {

                    var me = this;

                    $logger.info('createMarker', 'start', true);

                    if (me.listMarkerTaxi.length > 0) {
                        angular.forEach(me.listMarkerTaxi, function (v, k) {
                            me.map.removeLayer(v);
                        })
                    }
                    me.listMarkerTaxi = [];
                    var i = 0;
                    for (var property in listPoint) {
                        if (listPoint.hasOwnProperty(property)) {

                            if (angular.isObject(listPoint[property])) {
                                if (filter) {
                                    if (listPoint[property].seatNum == filter) {
                                        var position = new L.LatLng(listPoint[property].lat, listPoint[property].lng);

                                        var newMarker = L.marker(position, {
                                            riseOnHover: true,
                                            alt: 'myName',
                                            carLic: property,
                                            icon: L.icon({
                                                iconUrl: './images/taxi.png',
                                                iconSize: [40, 62]
                                            })
                                        }).addTo(me.map)/*.bindPopup("<b>" + property + "</b><br />Taxi")*/;
                                        me.listMarkerTaxi.push(newMarker);
                                    }

                                } else {

                                    var position = new L.LatLng(listPoint[property].lat, listPoint[property].lng);

                                    var newMarker = L.marker(position, {
                                        riseOnHover: true,
                                        alt: 'myName',
                                        carLic: property,
                                        icon: L.icon({
                                            iconUrl: './images/taxi.png',
                                            iconSize: [40, 62]
                                        })
                                    }).addTo(me.map)/*.bindPopup("<b>" + property + "</b><br />Taxi")*/;

                                    me.listMarkerTaxi.push(newMarker);
                                }
                            }
                        }
                    }
                },

                findTaxi: function (filter) {
                    $logger.info('findTaxi', 'start', true);
                    var seatFilter = (filter) ? filter : 4;

                    socketIo.emit('find:taxi', {
                        deviceId: appConfig.deviceId,
                        seatNum: seatFilter
                    });

                }
            };
            return gMaps;

        }]);

